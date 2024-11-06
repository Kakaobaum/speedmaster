extends HSlider

@export var bus_master: String
var bus_index: int
@onready var volume_label = $MarginContainer/contents/HBoxContainer/VolumeValue  # Reference to the value label

func _ready() -> void:
	# Get the bus index for the specified bus name (not used to alter audio in this version)
	bus_index = AudioServer.get_bus_index(bus_master)

	# Just set a default value for the slider, without querying the actual audio bus
	value = 0.5  # start slider at 50%  for visual purposes

	# Connect the value_changed signal to the handler function for visual feedback
	value_changed.connect(_on_value_changed)

# Signal handler function
func _on_value_changed(value: float) -> void:
	# Commented out: This would normally update the bus volume based on the slider value
	# AudioServer.set_bus_volume_db(bus_index, linear_to_db(value))
	
	print("Slider moved to value:", value)  # Debugging print statement (optional)

# Convert dB to linear (not actively used, left here for completeness)
func db_to_linear(db: float) -> float:
	return pow(10, db / 20.0)

# Convert linear to dB (not actively used, left here for completeness)
func linear_to_db(value: float) -> float:
	return 20 * log(value) / log(10)
