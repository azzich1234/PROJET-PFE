<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Expand category enum to include 'listening'
        //    and make MCQ columns nullable (writing questions don't need them)
        Schema::table('test_questions', function (Blueprint $table) {
            $table->string('audio_path')->nullable()->after('passage')->comment('Audio file for listening questions');
            $table->string('correct_text')->nullable()->after('correct_option')->comment('Correct typed answer for writing questions');
        });

        // Change category enum to include 'listening'
        DB::statement("ALTER TABLE test_questions MODIFY COLUMN category ENUM('vocabulary','grammar','reading','listening','writing') NOT NULL");

        // Make MCQ columns nullable (writing questions won't have them)
        DB::statement("ALTER TABLE test_questions MODIFY COLUMN option_a VARCHAR(255) NULL");
        DB::statement("ALTER TABLE test_questions MODIFY COLUMN option_b VARCHAR(255) NULL");
        DB::statement("ALTER TABLE test_questions MODIFY COLUMN option_c VARCHAR(255) NULL");
        DB::statement("ALTER TABLE test_questions MODIFY COLUMN option_d VARCHAR(255) NULL");
        DB::statement("ALTER TABLE test_questions MODIFY COLUMN correct_option ENUM('a','b','c','d') NULL");

        // 2. Add listening_score to test_results
        Schema::table('test_results', function (Blueprint $table) {
            $table->unsignedSmallInteger('listening_score')->default(0)->after('reading_score');
        });
    }

    public function down(): void
    {
        Schema::table('test_questions', function (Blueprint $table) {
            $table->dropColumn(['audio_path', 'correct_text']);
        });

        DB::statement("ALTER TABLE test_questions MODIFY COLUMN category ENUM('vocabulary','grammar','reading','writing') NOT NULL");
        DB::statement("ALTER TABLE test_questions MODIFY COLUMN option_a VARCHAR(255) NOT NULL");
        DB::statement("ALTER TABLE test_questions MODIFY COLUMN option_b VARCHAR(255) NOT NULL");
        DB::statement("ALTER TABLE test_questions MODIFY COLUMN option_c VARCHAR(255) NOT NULL");
        DB::statement("ALTER TABLE test_questions MODIFY COLUMN option_d VARCHAR(255) NOT NULL");
        DB::statement("ALTER TABLE test_questions MODIFY COLUMN correct_option ENUM('a','b','c','d') NOT NULL");

        Schema::table('test_results', function (Blueprint $table) {
            $table->dropColumn('listening_score');
        });
    }
};
