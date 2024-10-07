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

# Funktionen für Hover-Sounds

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
	if event.is_action_pressed("ui_accept"):  # Shortcut für "Enter"
		_on_btn_start_game_pressed()  # Sound abspielen und die Funktion ausführen
	elif event.is_action_pressed("tutorial_shortcut"):  # Shortcut für "T"
		_on_btn_tutorial_pressed()  # Sound abspielen und die Funktion ausführen
	elif event.is_action_pressed("ui_cancel"):  # Shortcut für "Escape"
		_on_btn_exit_pressed()  # Sound abspielen und die Funktion ausführen
	elif event.is_action_pressed("settings_shortcut"):  # Shortcut für "S"
		_on_btn_settings_pressed()  # Sound abspielen und die Funktion ausführen

# Funktion für den Start Game-Button
func _on_btn_start_game_pressed() -> void:
	_play_audio("res://Audio/starten.mp3")
	await get_tree().create_timer(1.5).timeout  # Warte 1,5 Sekunden,damit der Sound zuerst abgespielt werden kann
	get_tree().change_scene_to_file("res://Scenes/game.tscn")

# Funktion für den Tutorial-Button
func _on_btn_tutorial_pressed() -> void:
	_play_audio("res://Audio/tutorial.mp3")
	await get_tree().create_timer(1.5).timeout  # Warte 1,5 Sekunden,damit der Sound zuerst abgespielt werden kann
	get_tree().change_scene_to_file("res://Scenes/tutorial.tscn")

# Funktion für den Exit-Button
func _on_btn_exit_pressed() -> void:
	_play_audio("res://Audio/verlassen.mp3")
	await get_tree().create_timer(1.5).timeout  # Warte 1,5 Sekunden,damit der Sound zuerst abgespielt werden kann
	get_tree().quit()

# Funktion für den Settings-Button
func _on_btn_settings_pressed() -> void:
	_play_audio("res://Audio/settings.mp3")
	await get_tree().create_timer(1.5).timeout  # Warte 1,5 Sekunden
	get_tree().change_scene_to_file("res://Scenes/settings.tscn") # Warte 1,5 Sekunden,damit der Sound zuerst abgespielt werden kann
