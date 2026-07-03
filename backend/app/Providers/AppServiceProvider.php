<?php

namespace App\Providers;

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\ServiceProvider;
use Symfony\Component\Mailer\Transport\Dsn;
use Symfony\Component\Mailer\Transport\Smtp\EsmtpTransportFactory;
use Symfony\Component\Mailer\Transport\Smtp\Stream\SocketStream;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        Mail::extend('smtp', function (array $config) {
            $factory = new EsmtpTransportFactory;
            $scheme = $config['scheme'] ?? (($config['port'] ?? 465) == 465 ? 'smtps' : 'smtp');
            $transport = $factory->create(new Dsn(
                $scheme,
                $config['host'],
                $config['username'] ?? null,
                $config['password'] ?? null,
                $config['port'] ?? null,
                $config
            ));
            $stream = $transport->getStream();
            if ($stream instanceof SocketStream) {
                if (isset($config['stream'])) {
                    $stream->setStreamOptions($config['stream']);
                }
                if (isset($config['timeout'])) {
                    $stream->setTimeout($config['timeout']);
                }
                if (isset($config['source_ip'])) {
                    $stream->setSourceIp($config['source_ip']);
                }
            }
            return $transport;
        });
    }
}
