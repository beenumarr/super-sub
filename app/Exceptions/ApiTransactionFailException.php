<?php

namespace App\Exceptions;

use Exception;
use Symfony\Component\HttpKernel\Exception\HttpException;

class ApiTransactionFailException extends HttpException
{
    protected $status;
    protected $errorCode;

    public function __construct(string $message, string $errorCode = '0000', int $status = 400)
    {
        parent::__construct($status, $message);
        $this->status = $status;
        $this->errorCode = $errorCode;
    }

    public function render($request)
    {
        //424, 401

        return response()->json([
            'error' => [$this->getMessage()],
            'code' => $this->status,
            'msg' => $this->getMessage(),
            'message'=> $this->getMessage(),
        ], $this->status);
    }
}
