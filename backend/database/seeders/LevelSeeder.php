<?php

namespace Database\Seeders;

use App\Models\Language;
use App\Models\Level;
use Illuminate\Database\Seeder;

class LevelSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            ['name' => 'Beginner',     'description' => 'Start from scratch with the basics.',           'order' => 1],
            ['name' => 'Intermediate', 'description' => 'Build on fundamentals and expand your skills.', 'order' => 2],
            ['name' => 'Advanced',     'description' => 'Master complex topics and achieve fluency.',    'order' => 3],
        ];

        // Create the 3 levels for every existing language
        foreach (Language::all() as $language) {
            foreach ($templates as $tpl) {
                Level::updateOrCreate(
                    ['language_id' => $language->id, 'order' => $tpl['order']],
                    array_merge($tpl, ['language_id' => $language->id])
                );
            }
        }
    }
}
