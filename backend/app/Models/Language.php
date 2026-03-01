<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Language extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'image',
        'is_active',
        'instructor_id',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * The instructor assigned to this language.
     */
    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function levels()
    {
        return $this->hasMany(Level::class)->orderBy('order');
    }
}
