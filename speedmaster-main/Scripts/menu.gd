extends Control

var buttons = []
var current_button_index = 0
var audio_player: AudioStreamPlayer2D

func _ready() -> void:
	# Store menu buttons in array in order
	buttons = [
		$VBoxContainer/btnStartGame,
		$VBoxContainer/btnTutorial,
		$VBoxContainer/btnSettings,
		$VBoxContainer/btnExit
	]
	
	# Set focus on the first button
	buttons[current_button_index].grab_focus()

	# Play welcome audio 
	audio_player = $AudioStreamPlayer2D
	_play_audio("res://Audio/welcome.mp3")

	# Connect button signals for hover sounds
	_connect_button_signals()

func _connect_button_signals():
	$VBoxContainer/btnStartGame.connect("focus_entered", Callable(self, "_on_button_hovered").bind(0))
	$VBoxContainer/btnTutorial.connect("focus_entered", Callable(self, "_on_button_hovered").bind(1))
	$VBoxContainer/btnSettings.connect("focus_entered", Callable(self, "_on_button_hovered").bind(2))
	$VBoxContainer/btnExit.connect("focus_entered", Callable(self, "_on_button_hovered").bind(3))


# Play audio file
func _play_audio(audio_file: String) -> void:
	var audio_stream = load(audio_file) as AudioStream
	if audio_stream:
		audio_player.stream = audio_stream
		audio_player.play()

# Focus navigation: previous button
func _focus_previous_button():
	current_button_index = (current_button_index - 1 + buttons.size()) % buttons.size()
	for button in buttons:
		button.focus_mode = Control.FOCUS_NONE  # Disable all focus modes first
	buttons[current_button_index].focus_mode = Control.FOCUS_ALL  # Enable focus for selected button
	buttons[current_button_index].grab_focus()
	print("Focused button index:", current_button_index)

# Focus navigation: next button
func _focus_next_button():
	current_button_index = (current_button_index + 1) % buttons.size()
	for button in buttons:
		button.focus_mode = Control.FOCUS_NONE
	buttons[current_button_index].focus_mode = Control.FOCUS_ALL
	buttons[current_button_index].grab_focus()
	print("Focused button index:", current_button_index)


# Activate the current button's function
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

# Hover sound function based on the button index
func _on_button_hovered(index: int) -> void:
	match index:
		0:
			_play_audio("res://Audio/starten.mp3")
		1:
			_play_audio("res://Audio/tutorial.mp3")
		2:
			_play_audio("res://Audio/settings.mp3")
		3:
			_play_audio("res://Audio/verlassen.mp3")
