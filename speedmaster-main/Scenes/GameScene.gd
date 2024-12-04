extends Node2D

# Verweis auf den AudioStreamPlayer-Knoten
@onready var audio_player = $AudioPlayer
@onready var background_music_player = $SongPlayer
@onready var feedback = $FeedbackAudioPlayer
@onready var feedback_score = $FeedbackGameScoring
# Notensounds vorladen
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
var good = preload("res://Audio/good.mp3")
var wrong = preload("res://Audio/wrong.mp3")
var finished = preload("res://Audio/finished.mp3")
var game_started = false

# One-time steps.
# Pick a voice. Here, we arbitrarily pick the first English voice.
var voices = DisplayServer.tts_get_voices_for_language("en")
var voice_id = voices[0]


# Timing and scoring variables
var score = 0
var note_timestamps_A = [0.5, 15.5, 30.5, 45.5, 60.5]
var note_timestamps_S = [3.6, 18.5, 33.5, 48.6]
var note_timestamps_D = [7.3, 11.1, 22.3, 37.3, 52.36]
var note_timestamps_F = [11.1, 15.5, 26, 40.89, 56.08]

# Constants for scoring thresholds
const PERFECT_TIMING_WINDOW = 0.5  # 0.5 seconds before or after the timestamp
const NO_POINTS_WINDOW = 1.0      # 1.0 seconds before or after the timestamp

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
	audio_player.play()


# Funktion zum Verarbeiten von Eingaben
func _input(event: InputEvent) -> void:
	var current_time = background_music_player.get_playback_position()

	if event.is_action_pressed("note_a"):
		handle_key_press("A", current_time, note_timestamps_A)
	elif event.is_action_pressed("note_s"):
		handle_key_press("S", current_time, note_timestamps_S)
	elif event.is_action_pressed("note_d"):
		handle_key_press("D", current_time, note_timestamps_D)
	elif event.is_action_pressed("note_f"):
		handle_key_press("F", current_time, note_timestamps_F)

# Handle key presses and calculate score
func handle_key_press(note: String, current_time: float, timestamps: Array):
	var matched = false
	var matched_timestamp = null  # Variable to store the matched timestamp

	if game_started:
		# Check all timestamps for the current note
		for timestamp in timestamps:
			var time_difference = abs(current_time - timestamp)
			if time_difference <= PERFECT_TIMING_WINDOW:
				# Perfect timing
				score += 5
				play_feedback("good")
				matched = true
				matched_timestamp = timestamp  # Store the matched timestamp
				print("Perfect timing for ", note, "! Score: ", score)
				break
			elif time_difference <= NO_POINTS_WINDOW:
				# Close timing, no points
				print("Close for ", note, ", but no points.")
				matched = true
				matched_timestamp = timestamp  # Store the matched timestamp
				break
	
		# If no match, apply penalty
		if not matched:
			score -= 1
			play_feedback("wrong")
			print("Missed timing for ", note, "! Score: ", score)
	else:
		print("Key pressed: " + note)
		
	# Play note sound
	play_note_sound(note)

	# Remove matched timestamps
	if matched_timestamp != null:
		timestamps.erase(matched_timestamp)

# Play feedback sounds for scoring (parallel to note sound)
func play_feedback(type: String):
	if type == "good":
		feedback_score.stream = good
	elif type == "wrong":
		feedback_score.stream = wrong
	feedback_score.play()

# Feedback sounds during the countdown
func play_feedback_sounds() -> void:
	# Play the game_starter sound
	feedback.stream = game_starter
	feedback.play()
	await feedback.finished
	
	# Wait
	await get_tree().create_timer(6.0).timeout
	var feedback_sounds = [feedback_good, cntdwn_starter, cntdwn_2, cntdwn_1]
	for sound in feedback_sounds:
		feedback.stream = sound
		feedback.play()
		await feedback.finished
# End game functionality
func end_game() -> void:
	game_started = false
	await get_tree().create_timer(2.0).timeout  # Wait 2 seconds after music ends

	# Play finished sound
	feedback_score.stream = finished
	feedback_score.play()
	await feedback_score.finished

	# Text-to-speech announcement for final score
	var speech = "Congratulations! Your score is " + str(score)
	DisplayServer.tts_speak(speech, voice_id)
	print(speech)
	await get_tree().create_timer(2.0).timeout 
	get_tree().change_scene_to_file("res://Scenes/menu.tscn")


# Scene setup
func _ready() -> void:
	await play_feedback_sounds()
	# Lower volume of the keys
	audio_player.volume_db = -8
	await get_tree().create_timer(1.0).timeout
	background_music_player.stream = song
	game_started = true
	background_music_player.play()
# Connect the background music end to the end_game function
	background_music_player.finished.connect(end_game)
