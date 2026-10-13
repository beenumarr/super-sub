<?php

test('deploy migrate route returns 403 when token is missing or invalid', function () {
    $response = $this->post('/deploy/migrate');
    $response->assertStatus(403);

    $apiResponse = $this->post('/api/deploy/migrate', ['token' => 'invalid-token']);
    $apiResponse->assertStatus(403);
});

test('deploy migrate route succeeds with valid token', function () {
    config(['app.key' => 'base64:C0Xhs5HtrNp0BACJ5vnbziLvyLWuBPs/c2oQyoe9ofo=']);

    $response = $this->post('/api/deploy/migrate', [
        'token' => 'base64:C0Xhs5HtrNp0BACJ5vnbziLvyLWuBPs/c2oQyoe9ofo=',
    ]);

    $response->assertOk();
    $response->assertJson([
        'status' => 'success',
    ]);
});
