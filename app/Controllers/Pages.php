<?php

namespace App\Controllers;

use App\Models\StarWarsModel;

class Pages extends BaseController
{

    public function view($page = 'home')
    {

        if (!is_file(APPPATH . '/Views/pages/' . $page . '.php')) {
            throw new \CodeIgniter\Exceptions\PageNotFoundException($page);
        }

        echo view('templates/header');
        echo view('pages/' . $page);
        echo view('templates/footer');
    }
}
