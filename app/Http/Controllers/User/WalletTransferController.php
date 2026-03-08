<?php

namespace App\Http\Controllers\User;

use Exception;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Http\Requests\Transaction\WalletTransferRequest;
use App\Utils\Transaction\TransactionHelper;
use Illuminate\Validation\ValidationException;
use App\Http\Resources\TransactionDetailResource;

class WalletTransferController extends Controller
{
    protected $helpers;

    public function __construct(TransactionHelper $helpers)
    {
        $this->helpers = $helpers;
        $this->middleware('permission:wallet_transfer', ['only' => ['index','store']]);

    }

    /**
         * Display the Wallet Transfer page
         *
         * @param Request $request
         * @return Response
         */
        public function index(Request $request): Response
        {
            return Inertia::render('WalletTransfer/Index', [
                'data' => session('data'),
            ]);
        }



        public function store(WalletTransferRequest $request)
        {
            $data = $request->validated();

            $beneficiary = $this->getBeneficiary($data['input']);


            $transaction = $this->performTransaction($request, $beneficiary, $data);

            if ($transaction->status !== 'success') {
                DB::rollBack();
                throw ValidationException::withMessages([
                    'status' => $transaction->api_response ?? 'Transaction failed. Please try again later.',
                ]);
            }

            if ($request->wantsJson()) {
                return response()->json(new TransactionDetailResource($transaction, false));
            }


            return back();
        }

        public function validateUser(Request $request)
        {
                $data = $request->validate([
                    'input' => 'required|string',
                ]);

                $beneficiary = $this->getBeneficiary($data['input']);


                if ($request->wantsJson()) {
                    return response()->json($beneficiary);
                }


                return back()->with(['data'=> $beneficiary]);

        }


                /**
         * Fetch the beneficiary user by input (email or phone)
         *
         * @param string $input
         * @return User
         * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
         */
        protected function getBeneficiary(string $input): User
        {
            $authenticatedUser = auth()->user();

            $user = User::where(function ($query) use ($input) {
                $query->where('email', $input)
                      ->orWhere('phone', $input);
            })
            ->where('id', '!=', $authenticatedUser->id)
            ->first(['name','phone','email','id']);

            if (!$user) {

                throw ValidationException::withMessages([
                    'status' => 'User not found. Please check the email or phone number and try again.',
                ]);

            }

            return $user;
        }



    /**
     * Perform the Wallet Transfer transaction
     *
     * @param Request $request
     * @param User $beneficiary
     * @param array $data
     * @return mixed
     * @throws ValidationException
     */
    protected function performTransaction(Request $request, User $beneficiary, array $data)
    {
        $sender = auth()->user();

        $this->helpers->checkServiceActive($sender, '002', 'wallet_transfer');

        $this->helpers->validateUserSpendingLimit($sender, $data['amount']);

        $senderRef = $this->helpers->generateTransactionRef('WT');
        $beneficiaryRef = $this->helpers->generateTransactionRef('WT');

        $descriptionSender = "Fund Transfer of {$data['amount']} to {$beneficiary->name} ({$beneficiary->phone}). Beneficiary Ref: {$beneficiaryRef}";
        $descriptionBeneficiary = "Fund Transfer received from {$sender->name} ({$sender->phone}). Sender Ref: {$senderRef}";

        try {
            DB::beginTransaction();

            $balance = $this->helpers->validateBalanceAndDeductAmount($sender->id, $data['amount']);

            $senderTransactionable = WalletTransaction::create([
                'user_id' => $sender->id,
                'wallet_id' => $sender->wallet->id,
                'amount' => $data['amount'],
                'type' => 'debit',
                'method' => 'WALLET_TRANSFER',
                'payment_gateway' => 'internal',
            ]);

            $senderTransactionData = [
                'reference' => $senderRef,
                'user_id' => $sender->id,
                'amount' => $data['amount'],
                'status'=> 'success',
                'description' => $descriptionSender,
                'api_response' => 'Wallet Transfer',
                'balance_before' => (float)$balance['before'],
                'balance_after' => (float)$balance['after'],
            ];

            $transaction = $senderTransactionable->transaction()->create($senderTransactionData);

            $beneficiaryWallet = $beneficiary->wallet;
            $beneficiaryBalanceBefore = $beneficiaryWallet->balance;
            $beneficiaryWallet->increment('balance', $data['amount']);
            $beneficiaryBalanceAfter = $beneficiaryWallet->balance;

            $beneficiaryTransactionable = WalletTransaction::create([
                'user_id' => $beneficiary->id,
                'wallet_id' => $beneficiaryWallet->id,
                'amount' => $data['amount'],
                'type' => 'credit',
                'method' => 'WALLET_TRANSFER',
                'payment_gateway' => 'internal',
            ]);

            $beneficiaryTransactionData = [
                'reference' => $beneficiaryRef,
                'user_id' => $beneficiary->id,
                'amount' => $data['amount'],
                'status'=> 'success',
                'description' => $descriptionBeneficiary,
                'api_response' => 'Wallet Transfer',
                'balance_before' => (float)$beneficiaryBalanceBefore,
                'balance_after' => (float)$beneficiaryBalanceAfter,
            ];

            $beneficiaryTransactionable->transaction()->create($beneficiaryTransactionData);

            DB::commit();

            Log::channel('general_transactions')->info('Wallet Transfer', [
                'sender' => $sender->email,
                'beneficiary' => $beneficiary->email,
                'amount' => $data['amount'],
                'sender_ref' => $senderRef,
                'beneficiary_ref' => $beneficiaryRef,
                'sender_balance_before' => (float)$balance['before'],
                'sender_balance_after' => (float)$balance['after'],
                'beneficiary_balance_before' => (float)$beneficiaryBalanceBefore,
                'beneficiary_balance_after' => (float)$beneficiaryBalanceAfter,
                'ip_address' => $request->ip(),
            ]);

            return $transaction;

        } catch (Exception $e) {
            DB::rollBack();

            Log::error('Wallet Transfer Error: ' . $e->getMessage());

            throw ValidationException::withMessages([
                'status' => 'Transaction failed. Please try again later. Error: ' . $e->getMessage(),
            ]);
        }
    }





}
