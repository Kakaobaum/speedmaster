extends HSlider

@export var bus_master: String  # Audio bus name, e.g., "Master"
var bus_index: int
@onready var volume_label = $"../HBoxContainer/VolumeValue"  # Relative path to the label
var settings_file : FileAccess

# File path to save the volume setting
const VOLUME_FILE_PATH = "user://volume_settings.dat"

func _ready() -> void:
	# Get the bus index for the specified audio bus
	bus_index = AudioServer.get_bus_index(bus_master)

	# Set the slider's range to [0, 2] and configure step
	min_value = 0
	max_value = 2  # Allows for boosting above the default max
	step = 0.05  # Adjusts slider sensitivity; can be set lower for finer control

	# Load the saved volume value if it exists, otherwise set to default
	var saved_value = load_volume_setting()

	# Set slider to saved value or default (if no saved value exists)
	value = saved_value if saved_value != -1 else 1.0  # Default to 1.0 (0 dB)

	# Connect the `value_changed` signal to the handler function
	value_changed.connect(_on_value_changed)

	# Print the initial volume in dB
	var initial_db_value = linear_to_db(value)
	AudioServer.set_bus_volume_db(bus_index, initial_db_value)  # Set the initial bus volume
	print("Initial slider value:", value, ", Initial dB value:", initial_db_value)
	
	# Update label with initial volume if it exists
	if volume_label:
		volume_label.text = str("%.1f" % initial_db_value) + " dB"

# Signal handler function, called whenever the slider value changes
func _on_value_changed(value: float) -> void:
	# Convert slider value (0 to 2) to dB (-80 to +6)
	var db_value = linear_to_db(value)
	# Set the volume of the specified bus in dB
	AudioServer.set_bus_volume_db(bus_index, db_value)
	
	# Update the label if it exists
	if volume_label:
		volume_label.text = str("%.1f" % db_value) + " dB"
	
	# Save the current slider value to file
	save_volume_setting(value)
	
	# Debugging: Print the slider and dB values
	print("Slider moved to value:", value, ", dB value:", db_value)

# Helper function to convert linear value (0 to 2) to dB (-80 to +6)
func linear_to_db(value: float) -> float:
	if value <= 1.0:
		# Map 0-1 to -80 to 0 dB
		return lerp(-80, 0, value)
	else:
		# Map 1-2 to 0 to +6 dB (or adjust to a higher max if needed)
		return lerp(0, 6, value - 1)

# Save the volume setting to a file
func save_volume_setting(value: float) -> void:
	settings_file = FileAccess.open(VOLUME_FILE_PATH, FileAccess.WRITE)
	if settings_file:
		settings_file.store_var(value)  # Save the volume value to file
		settings_file.close()
	else:
		print("Failed to save volume setting.")

# Load the volume setting from a file
func load_volume_setting() -> float:
	settings_file = FileAccess.open(VOLUME_FILE_PATH, FileAccess.READ)
	if settings_file:
		var value = settings_file.get_var()  # Read the saved value
		settings_file.close()
		return value
	else:
		print("No saved volume setting found.")
		return -1  # Return -1 to indicate no saved value
