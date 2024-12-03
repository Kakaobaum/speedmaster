extends Node2D

# Verweis auf den AudioStreamPlayer-Knoten
@onready var audio_player = $AudioPlayer
@onready var background_music_player = $SongPlayer
@onready var feedback = $FeedbackAudioPlayer
# Notensounds vorladen (Diese sollten bereits in den vorherigen Schritten erstellt worden sein)
var note_a_sound = preload("res://Audio/0.mp3")
var note_s_sound = preload("res://Audio/3.mp3")
var note_d_sound = preload("res://Audio/5.mp3")
var note_f_sound = preload("res://Audio/6.mp3")
var cntdwn_starter = preload("res://Audio/countdownStarter.mp3")
var feedback_good = preload("res://Audio/greatJob.mp3")
var cntdwn_2 = preload("res://Audio/countrdown_2.mp3")
var cntdwn_1 = preload("res://Audio/countdown_1.mp3")
var game_starter = preload("res://Audio/mainGameStarter.mp3")
var song = preload("res://Audio/penguinmusic.mp3")
# Funktion zum Abspielen des Notensounds basierend auf der Note
func play_note_sound(note):
	match note:
		"A":
			audio_player.stream = note_a_sound
		"S":
			audio_player.stream = note_s_sound
		"D":
			audio_player.stream = note_d_sound
		"F":
			audio_player.stream = note_f_sound
		_:
			pass
	audio_player.play()

# Funktion zum Verarbeiten von Eingaben
func _input(event: InputEvent) -> void:
	if event.is_action_pressed("note_a"):
		print("note_a pressed")
		play_note_sound("A")
	elif event.is_action_pressed("note_s"):
		print("note_s pressed")
		play_note_sound("S")
	elif event.is_action_pressed("note_d"):
		print("note_d pressed")
		play_note_sound("D")
	elif event.is_action_pressed("note_f"):
		print("note_f pressed")
		play_note_sound("F")
		

func play_feedback_sounds() -> void:
	# Play the game_starter sound
	feedback.stream = game_starter
	feedback.play()
	await feedback.finished
	
	# Wait 
	await get_tree().create_timer(10.0).timeout 
	var feedback_sounds = [feedback_good, cntdwn_starter, cntdwn_2, cntdwn_1]
	for sound in feedback_sounds:
		feedback.stream = sound
		feedback.play()
		await feedback.finished
		
func _ready() -> void:
	await play_feedback_sounds()
	#lower volume of the keys
	audio_player.volume_db = -8
	background_music_player.stream = song
	background_music_player.play()
