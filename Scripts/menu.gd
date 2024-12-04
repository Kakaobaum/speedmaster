extends Control

var buttons = []
var current_button_index = 0
var audio_player: AudioStreamPlayer2D

func _ready() -> void:
	# Store buttons in an array for navigation
	buttons = [
		$VBoxContainer/btnStartGame,
		$VBoxContainer/btnTutorial,
		$VBoxContainer/btnSettings,
		$VBoxContainer/btnExit
	]

	# Set focus on the first button in the array
	buttons[current_button_index].grab_focus()

	# Play welcome audio
	audio_player = $AudioStreamPlayer2D
	_play_audio("res://Audio/welcome.mp3")

	# Connect button signals
	_connect_button_signals()

func _connect_button_signals():
	$VBoxContainer/btnStartGame.connect("focus_entered", Callable(self, "_on_btn_start_game_hovered"))
	$VBoxContainer/btnTutorial.connect("focus_entered", Callable(self, "_on_btn_tutorial_hovered"))
	$VBoxContainer/btnSettings.connect("focus_entered", Callable(self, "_on_btn_settings_hovered"))
	$VBoxContainer/btnExit.connect("focus_entered", Callable(self, "_on_btn_exit_hovered"))

func _play_audio(audio_file: String) -> void:
	var audio_stream = load(audio_file) as AudioStream
	if audio_stream:
		audio_player.stream = audio_stream
		audio_player.play()

# Arrow key navigation
func _focus_previous_button():
	current_button_index = (current_button_index - 1 + buttons.size()) % buttons.size()
	buttons[current_button_index].grab_focus()

func _focus_next_button():
	current_button_index = (current_button_index + 1) % buttons.size()
	buttons[current_button_index].grab_focus()

func _activate_current_button():
	match current_button_index:
		0:
			_on_btn_start_game_pressed()
		1:
			_on_btn_tutorial_pressed()
		2:
			_on_btn_settings_pressed()
		3:
			_on_btn_exit_pressed()

func _input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_down"):
		_focus_next_button()
	elif event.is_action_pressed("ui_up"):
		_focus_previous_button()
	elif event.is_action_pressed("ui_accept"):
		_activate_current_button()

# Button actions
func _on_btn_start_game_pressed() -> void:
	_play_audio("res://Audio/starten.mp3")
	await get_tree().create_timer(1.5).timeout
	get_tree().change_scene_to_file("res://Scenes/game.tscn")

func _on_btn_tutorial_pressed() -> void:
	_play_audio("res://Audio/tutorial.mp3")
	await get_tree().create_timer(1.5).timeout
	get_tree().change_scene_to_file("res://Scenes/tutorial.tscn")

func _on_btn_settings_pressed() -> void:
	_play_audio("res://Audio/settings.mp3")
	await get_tree().create_timer(1.5).timeout
	get_tree().change_scene_to_file("res://Scenes/settings.tscn")

func _on_btn_exit_pressed() -> void:
	_play_audio("res://Audio/verlassen.mp3")
	await get_tree().create_timer(1.5).timeout
	get_tree().quit()

# Hover sound functions
func _on_btn_start_game_hovered() -> void:
	_play_audio("res://Audio/starten.mp3")

func _on_btn_tutorial_hovered() -> void:
	_play_audio("res://Audio/tutorial.mp3")

func _on_btn_exit_hovered() -> void:
	_play_audio("res://Audio/verlassen.mp3")

func _on_btn_settings_hovered() -> void:
	_play_audio("res://Audio/settings.mp3")
