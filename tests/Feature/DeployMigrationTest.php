<?php

test('deploy migrate route succeeds and runs migrations', function () {
    $response = $this->post('/api/deploy/migrate');

    $response->assertOk();
    $response->assertJson([
        'status' => 'success',
    ]);
});
