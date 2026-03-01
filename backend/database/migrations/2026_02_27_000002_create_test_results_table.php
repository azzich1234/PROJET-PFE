<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('test_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('language_id')->constrained()->cascadeOnDelete();
            $table->foreignId('level_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('total_score');
            $table->unsignedSmallInteger('max_score');
            $table->unsignedSmallInteger('vocab_score')->default(0);
            $table->unsignedSmallInteger('grammar_score')->default(0);
            $table->unsignedSmallInteger('reading_score')->default(0);
            $table->unsignedSmallInteger('writing_score')->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'language_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('test_results');
    }
};
