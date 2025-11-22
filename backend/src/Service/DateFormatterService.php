<?php

namespace App\Service;

use DateTimeImmutable;
use DateTimeZone;

class DateFormatterService
{
    private DateTimeZone $timezone;

    public function __construct()
    {
        $this->timezone = new DateTimeZone('Europe/Paris');
    }

    public function formatDateTime(DateTimeImmutable $date): string
    {
        return $date->setTimezone($this->timezone)->format('d/m/Y H:i:s');
    }

    public function formatDate(DateTimeImmutable $date): string
    {
        return $date->setTimezone($this->timezone)->format('d/m/Y');
    }

    public function formatTime(DateTimeImmutable $date): string
    {
        return $date->setTimezone($this->timezone)->format('H:i:s');
    }

    public function formatDateTimeISO(DateTimeImmutable $date): string
    {
        return $date->setTimezone($this->timezone)->format('Y-m-d\TH:i:sP');
    }

    public function getParisDateTime(DateTimeImmutable $date): DateTimeImmutable
    {
        return $date->setTimezone($this->timezone);
    }
}

