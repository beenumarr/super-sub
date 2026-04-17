<?php

use App\Models\Promotion;
use App\Models\User;
use App\Models\Wallet;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function createUserWithWallet(): User {
    $user = User::factory()->create();
    Wallet::create([
        'user_id' => $user->id,
        'balance' => 0,
        'bonus_balance' => 0,
        'a2c_balance' => 0,
        'active' => true,
    ]);
    return $user;
}

test('a user can redeem an active promo code once', function () {
    $user = createUserWithWallet();

    $promo = Promotion::create([
        'code' => 'APRILBONUS',
        'reward_amount' => 50,
        'max_redemptions' => 10,
        'redeemed_count' => 0,
        'is_active' => true,
        'starts_at' => now()->subMinute(),
        'ends_at' => null,
    ]);

    $this->actingAs($user)
        ->from('/referrals')
        ->post(route('promotions.redeem'), ['code' => 'aprilbonus'])
        ->assertRedirect('/referrals');

    expect((float) $user->wallet->fresh()->bonus_balance)->toBe(50.0);
    expect($promo->fresh()->redeemed_count)->toBe(1);
    $this->assertDatabaseHas('promotion_redemptions', [
        'promotion_id' => $promo->id,
        'user_id' => $user->id,
    ]);
});

test('a user cannot redeem the same promo twice', function () {
    $user = createUserWithWallet();

    Promotion::create([
        'code' => 'ONETIME',
        'reward_amount' => 10,
        'max_redemptions' => 100,
        'redeemed_count' => 0,
        'is_active' => true,
        'starts_at' => now()->subMinute(),
        'ends_at' => null,
    ]);

    $this->actingAs($user)
        ->from('/referrals')
        ->post(route('promotions.redeem'), ['code' => 'ONETIME'])
        ->assertRedirect('/referrals');

    $this->actingAs($user)
        ->from('/referrals')
        ->post(route('promotions.redeem'), ['code' => 'ONETIME'])
        ->assertSessionHasErrors('code');
});

test('promo redemption is blocked when max redemptions is reached', function () {
    $user1 = createUserWithWallet();
    $user2 = createUserWithWallet();

    Promotion::create([
        'code' => 'LIMIT1',
        'reward_amount' => 5,
        'max_redemptions' => 1,
        'redeemed_count' => 0,
        'is_active' => true,
        'starts_at' => now()->subMinute(),
        'ends_at' => null,
    ]);

    $this->actingAs($user1)
        ->from('/referrals')
        ->post(route('promotions.redeem'), ['code' => 'LIMIT1'])
        ->assertRedirect('/referrals');

    $this->actingAs($user2)
        ->from('/referrals')
        ->post(route('promotions.redeem'), ['code' => 'LIMIT1'])
        ->assertSessionHasErrors('code');
});
