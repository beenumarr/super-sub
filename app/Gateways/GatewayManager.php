<?php

namespace App\Gateways;

use App\Gateways\Contracts\DataGatewayInterface;
use App\Models\Gateway;

class GatewayManager
{
    /**
     * Resolve a data gateway implementation for the given Gateway model.
     *
     * By convention, the Gateway's model field should contain a provider key
     * (for example: "SMEPlug" or "Autofy"), and the concrete implementation
     * will live at: App\Gateways\<Provider>\DataGateway.
     */
    public function resolveDataGateway(Gateway $gateway): DataGatewayInterface
    {
        $provider = trim($gateway->model, '\\');
        $class = 'App\\Gateways\\' . $provider . '\\DataGateway';

        if (!class_exists($class)) {
            throw new \RuntimeException("Data gateway class [{$class}] not found for provider [{$provider}].");
        }

        $instance = app($class);

        if (!$instance instanceof DataGatewayInterface) {
            throw new \RuntimeException("Data gateway class [{$class}] must implement DataGatewayInterface.");
        }

        return $instance;
    }
}

