<?php

namespace App\Providers;

use App\Jobs\SendLatraPosition;
use App\Models\DevicePosition;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (! config('latra.enabled')) {
            return;
        }

        DevicePosition::created(function (DevicePosition $position): void {
            $identifier = $position->getKey();
            if ($identifier === null) {
                return;
            }

            SendLatraPosition::dispatch($identifier)->afterCommit();
        });
    }
}
