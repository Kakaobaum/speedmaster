extends Node  # Attach to the parent node of both slider and label (Settings)

@export 
var bus_master: String
@export var audio_clip: AudioStream  # Expose an audio clip for the test sound

@onready var slider = $MarginContainer/contents/masterVolume  # Reference to the HSlider node (masterVolume)
@onready var volume_label = $MarginContainer/contents/HBoxContainer/VolumeValue # Reference to the Label node (VolumeValue)

# Adjust min and max dB for reference (these are now just for display, no active sound change)
var min_db: float = -80.0  # Quietest level (e.g., 0% on slider)
var max_db: float = 0.0    # Maximum volume (e.g., 100% on slider)

func _ready() -> void:
	# Check if the slider and label are properly found
	if slider == null:
		print("Error: masterVolume slider not found!")
		return
	if volume_label == null:
		print("Error: VolumeValue label not found!")
		return

	# Initialize the slider value to 50% purely for visual purposes
	slider.value = 50
	update_volume_label(slider.value)
	
	# Connect the value_changed signal to update the label when the slider value changes
	slider.value_changed.connect(_on_value_changed)

# This function is called when the slider value changes
func _on_value_changed(value: float) -> void:
	# Clamp the value between 0 and 100% for display purposes only
	var clamped_value = clamp(value, 0.0, 100.0)
	
	# Update the volume label with the new slider value
	update_volume_label(clamped_value)

# This function updates the label text with the current volume
func update_volume_label(value: float) -> void:
	# Update the label with the current volume percentage
	volume_label.text = "  %.0f%%" % value

func _on_btn_menu_pressed() -> void:
	get_tree().change_scene_to_file("res://Scenes/menu.tscn")
