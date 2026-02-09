<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $company = auth()->user()->company;
        $company->load('chatbots');

        return Inertia::render('Customer/Dashboard', [
            'company' => $company,
        ]);
    }
}
