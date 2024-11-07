extends Node  # Attach to the parent node of the slider and label (Settings)

@export var audio_clip: AudioStream  # Expose an audio clip for the test sound (optional)

func _on_btn_menu_pressed() -> void:
	# Navigate back to the main menu scene when the button is pressed
	get_tree().change_scene_to_file("res://Scenes/menu.tscn")
