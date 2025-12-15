<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateKuotaSeminarsTable extends Migration
{
    public function up()
    {
        Schema::create('kuota_seminars', function (Blueprint $table) {
            $table->id();
            $table->string('nama_seminar');
            $table->integer('kuota');
            $table->integer('terisi')->default(0);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('kuota_seminars');
    }
}
