<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Level extends Model
{
    protected $fillable = ['name', 'description', 'order', 'language_id', 'is_active'];

    public function language()
    {
        return $this->belongsTo(Language::class);
    }

    public function chapters()
    {
        return $this->hasMany(Chapter::class);
    }
}
