extends Control



func _on_btn_start_game_pressed() -> void:
	get_tree().change_scene_to_file("res://Scenes/game.tscn") # Replace with function body.


func _on_btn_tutorial_pressed() -> void:
	get_tree().change_scene_to_file("res://Scenes/tutorial.tscn") # Replace with function body.


func _on_btn_exit_pressed() -> void:
	get_tree().quit() # Replace with function body.
