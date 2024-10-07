extends Control

var audio_player: AudioStreamPlayer2D  # Variable zum Speichern des AudioStreamPlayers

# Funktion, die aufgerufen wird, wenn das Hauptmenü geladen wird
func _ready() -> void:
	audio_player = $AudioStreamPlayer2D
	
	# Hover- und Fokus-Signale mit den Buttons verbinden
	$VBoxContainer/btnStartGame.connect("mouse_entered", Callable(self, "_on_btn_start_game_hovered"))
	$VBoxContainer/btnStartGame.connect("focus_entered", Callable(self, "_on_btn_start_game_hovered"))
	
	$VBoxContainer/btnTutorial.connect("mouse_entered", Callable(self, "_on_btn_tutorial_hovered"))
	$VBoxContainer/btnTutorial.connect("focus_entered", Callable(self, "_on_btn_tutorial_hovered"))
	
	$VBoxContainer/btnExit.connect("mouse_entered", Callable(self, "_on_btn_exit_hovered"))
	$VBoxContainer/btnExit.connect("focus_entered", Callable(self, "_on_btn_exit_hovered"))
	
	$VBoxContainer/btnSettings.connect("mouse_entered", Callable(self, "_on_btn_settings_hovered"))
	$VBoxContainer/btnSettings.connect("focus_entered", Callable(self, "_on_btn_settings_hovered"))

# Audio-Datei abspielen basierend auf dem bereitgestellten Pfad
func _play_audio(audio_file: String) -> void:
	var audio_stream = load(audio_file) as AudioStream
	if audio_stream:
		audio_player.stream = audio_stream
		audio_player.play()

# Funktionen für Hover - Sounds

# Wenn der 'Start Game'-Button gehovered wird
func _on_btn_start_game_hovered() -> void:
	_play_audio("res://Audio/starten.mp3")

# Wenn der 'Tutorial'-Button gehovered wird
func _on_btn_tutorial_hovered() -> void:
	_play_audio("res://Audio/tutorial.mp3")

# Wenn der 'Exit'-Button gehovered wird
func _on_btn_exit_hovered() -> void:
	_play_audio("res://Audio/verlassen.mp3")

# Wenn der 'Settings'-Button gehovered wird
func _on_btn_settings_hovered() -> void:
	_play_audio("res://Audio/settings.mp3")

# Tastatureingaben für Shortcuts definieren
func _input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_accept"):  # Spielstart auf Enter setzte
		_on_btn_start_game_pressed()
	elif event.is_action_pressed("tutorial_shortcut"):  # Tutorial auf T setzen
		_on_btn_tutorial_pressed()
	elif event.is_action_pressed("ui_cancel"):  # Spiel verlassen auf Escape setzen
		_on_btn_exit_pressed()
	elif event.is_action_pressed("settings_shortcut"):  # Einstellungen auf S setzen
		_on_btn_settings_pressed()


# Funktion für den Start Game-Button
func _on_btn_start_game_pressed() -> void:
	_play_audio("res://Audio/starten.mp3")
	get_tree().change_scene_to_file("res://Scenes/game.tscn")

# Funktion für den Tutorial-Button
func _on_btn_tutorial_pressed() -> void:
	_play_audio("res://Audio/tutorial.mp3")
	get_tree().change_scene_to_file("res://Scenes/tutorial.tscn")

# Funktion für den Exit-Button
func _on_btn_exit_pressed() -> void:
	_play_audio("res://Audio/verlassen.mp3")
	get_tree().quit()

# Funktion für den Settings-Button
func _on_btn_settings_pressed() -> void:
	_play_audio("res://Audio/settings.mp3")
	get_tree().change_scene_to_file("res://Scenes/settings.tscn")
