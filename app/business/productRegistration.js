import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import axios from "axios";
import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function RegisterProduct() {
  const [form, setForm] = useState({
    name: "",
    type: "",
    materials: "",
    origin: "",
    productionDate: "",
    description: "",
    productImage: null,
    processImage: null,
  });

  const [fontsLoaded] = useFonts({
    "Garet-Book": require("../../assets/fonts/garet/Garet-Book.ttf"),
    "Garet-Heavy": require("../../assets/fonts/garet/Garet-Heavy.ttf"),
    "Montserrat-Regular": require("../../assets/fonts/Montserrat/static/Montserrat-Regular.ttf"),
    "Montserrat-Bold": require("../../assets/fonts/Montserrat/static/Montserrat-Bold.ttf"),
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (date) => date.toISOString().split("T")[0];

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) handleInputChange("productionDate", formatDate(selectedDate));
  };

  const pickImage = async (key) => {
    try {
      if (Platform.OS === "web") {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            setForm((prev) => ({
              ...prev,
              [key]: {
                uri: URL.createObjectURL(file),
                file,
                name: file.name,
                type: file.type,
              },
            }));
          }
        };
        input.click();
      } else {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
        });
        if (!result.canceled) {
          const asset = result.assets[0];
          setForm((prev) => ({
            ...prev,
            [key]: {
              uri: asset.uri,
              name: asset.fileName || "image.jpg",
              type: asset.mimeType || "image/jpeg",
            },
          }));
        }
      }
    } catch {
      Alert.alert("Error selecting image");
    }
  };

  const handleInputChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const resize = () => setIsMobile(Dimensions.get("window").width < 700);
    resize();
    Dimensions.addEventListener("change", resize);
    return () => Dimensions.removeEventListener("change", resize);
  }, []);

  const handleSubmit = async () => {
    const newErrors = {};
    if (!form.name) newErrors.name = "Product name is required";
    if (!form.type) newErrors.type = "Product type is required";
    if (!form.materials) newErrors.materials = "Materials are required";
    if (!form.origin) newErrors.origin = "Origin is required";
    if (!form.productionDate) newErrors.productionDate = "Finish date is required";
    if (!form.description) newErrors.description = "Description required";
    if (!form.productImage) newErrors.productImage = "Product image is required";
    if (!form.processImage) newErrors.processImage = "Process image is required";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    setStatusMessage("Registering product...");

    try {
      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k !== "productImage" && k !== "processImage") formData.append(k, v);
      });

      if (Platform.OS === "web") {
        formData.append("product_image", form.productImage.file);
        formData.append("process_image", form.processImage.file);
      } else {
        formData.append("product_image", form.productImage);
        formData.append("process_image", form.processImage);
      }

      await axios.post("https://verilocal.onrender.com/api/products", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStatusMessage("Product registered successfully!");
      setForm({
        name: "",
        type: "",
        materials: "",
        origin: "",
        productionDate: "",
        description: "",
        productImage: null,
        processImage: null,
      });
    } catch {
      Alert.alert("Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const router = useRouter();

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: "#f6f7fb" }}
      contentContainerStyle={{ alignItems: "center", paddingVertical: 20 }}
    >
      <View style={{ position: "absolute", top: 20, left: 20, zIndex: 10}}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={40} color="#333" style={{ marginBottom: 10, marginLeft: 10 }} />
        </Pressable>
      </View>
      <View style={[styles.card, isMobile && {flexDirection: "column"}]}>
      {/* LEFT BANNER IMAGE */}
        <View style={[styles.leftPanel, isMobile && { width: "100%", height: 200 }]}>
          <Image source={require("../../assets/business.png")} 
          style={styles.bannerImage} 
          resizeMode="cover" 
          />
        </View>
      {/* RIGHT PANEL */}
        <View style={[styles.rightPanel, isMobile && { width: "100%" }]}>
          <Text style={styles.formTitle}>Product Registration</Text>
          <Text style={styles.subtitle}>Register your product to be chuchuchu</Text>
          <View style={[styles.row, isMobile && { flexDirection: "column" }]}>
            <View style={[styles.col, isMobile && { minWidth: "100%"}]}>
              {statusMessage !== "" && <Text style={styles.statusMessage}>{statusMessage}</Text>}
              <Text style={styles.label}>Name of the Product*</Text>
              <InputField label="Product Name" value={form.name} onChange={(v) => handleInputChange("name", v)} error={errors.name} />
              
              <Text style={styles.label}>Type of Product*</Text>
              <View style={styles.inputContainer}>
                <Picker
                  selectedValue={form.type}
                  onValueChange={(v) => {
                    handleInputChange("type", v);
                    handleInputChange("materials", "");
                  }}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Type" value="" />
                  <Picker.Item label="Woodcraft" value="woodcraft" />
                  <Picker.Item label="Textile" value="textile" />
                  <Picker.Item label="Jewelry" value="jewelry" />
                </Picker>
                {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
              </View>

              {form.type === "woodcraft" && (
                <View style={styles.inputContainer}>
                  <Picker
                    selectedValue={form.materials}
                    onValueChange={(v) => handleInputChange("materials", v)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select Material" value="" />
                    <Picker.Item label="Kamagong Wood" value="Kamagong Wood" />
                    <Picker.Item label="Acacia Wood" value="Acacia Wood" />
                    <Picker.Item label="Pine Wood" value="Pine Wood" />
                  </Picker>
                  {errors.materials && <Text style={styles.errorText}>{errors.materials}</Text>}
                </View>
              )}

              {form.type === "textile" && (
                <View style={styles.inputContainer}>
                  <Picker
                    selectedValue={form.materials}
                    onValueChange={(v) => handleInputChange("materials", v)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select Material" value="" />
                    <Picker.Item label="Cotton" value="Cotton" />
                    <Picker.Item label="Abaca Fiber" value="Abaca Fiber" />
                    <Picker.Item label="Natural Plant Dyes" value="Natural Plant Dyes" />
                  </Picker>
                  {errors.materials && <Text style={styles.errorText}>{errors.materials}</Text>}
                </View>
              )}

              {form.type === "jewelry" && (
                <View style={styles.inputContainer}>
                  <Picker
                    selectedValue={form.materials}
                    onValueChange={(v) => handleInputChange("materials", v)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select Material" value="" />
                    <Picker.Item label="Gold" value="Gold" />
                    <Picker.Item label="Silver" value="Silver" />
                    <Picker.Item label="Shells / Beads" value="Shells / Beads" />
                  </Picker>
                  {errors.materials && <Text style={styles.errorText}>{errors.materials}</Text>}
                </View>
              )}
          

              <Text style={styles.label}>Origin*</Text>
              <InputField label="Origin" value={form.origin} onChange={(v) => handleInputChange("origin", v)} error={errors.origin} />
            </View>

            <View style={[styles.col, isMobile && { minWidth: "100%"}]}>
              <Text style={styles.label}>Production Date*</Text>
                {Platform.OS === "web" ? (
                  <input
                    type="date"
                    value={form.productionDate}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) =>
                      handleInputChange("productionDate", e.target.value)
                    }
                    style={{
                      height: 20,
                      borderRadius: 8,
                      padding: 12,
                      fontFamily: "Montserrat-Regular",
                      borderWidth: 1,
                      marginBottom: 10,
                      borderColor: "#ccc",
                      backgroundColor: "#fafafa",
                    }}
                  />
                ) : (
                  <Pressable
                    style={styles.dateWrapper}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text>
                      {form.productionDate || "Select Production Date"}
                    </Text>
                  </Pressable>
                )}

                {errors.productionDate && (
                  <Text style={styles.errorText}>{errors.productionDate}</Text>
                )}

              <Text style={styles.label}>Description*</Text>
              <InputField style= {styles.textArea} label="Description" value={form.description} onChange={(v) => handleInputChange("description", v)} multiline error={errors.description} />
            </View>
          </View>
          <Text style={styles.label}>Image of the Product*</Text>
          <Pressable style={styles.imagePicker} onPress={() => pickImage("productImage")}>
            {form.productImage ? <Image source={{ uri: form.productImage.uri }} style={styles.imagePreview} /> : <Text style={styles.imageText}>Select Product Image</Text>}
          </Pressable>
          
          <Text style={styles.label}>Images of the Process*</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 5}}>
            <Pressable style={[styles.imagePicker, { width: "49%" }]} onPress={() => pickImage("processImage")}>
              {form.processImage ? <Image source={{ uri: form.processImage.uri }} style={styles.imagePreview} /> : <Text style={styles.imageText}>Select Process Image</Text>}
            </Pressable>

            <Pressable style={[styles.imagePicker,{ width: "49%" }]} onPress={() => pickImage("processImage")}>
              {form.processImage ? <Image source={{ uri: form.processImage.uri }} style={styles.imagePreview} /> : <Text style={styles.imageText}>Select Process Image</Text>}
            </Pressable>
          </View>
          <Pressable style={styles.submitButton} onPress={handleSubmit} disabled={isSubmitting}>
            <Text style={styles.submitText}>Submit</Text>
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              value={form.productionDate ? new Date(form.productionDate) : new Date()}
              mode="date"
              maximumDate={new Date()}
              onChange={onDateChange}
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function InputField({ label, value, onChange, multiline, error,  }) {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        placeholder={label}
        value={value}
        onChangeText={onChange}
        multiline={multiline}
        style={[styles.input, multiline && styles.textArea, error && styles.errorInput]}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  card: {
    width: "100%",
    maxWidth: 1500,
    minHeight: 600,
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    flexDirection: "row",
    elevation: 6,
  },
  rightPanel: {
    flex: 1,
    padding: 28,
    backgroundColor: "#fff",
  },
  infoPanel: {
    flex: 1,
    backgroundColor: "#4A70A9",
    padding: 20,
    justifyContent: "center",
    marginBottom: 20,
  },
  accountButton: { backgroundColor: "#fff", padding: 10, borderRadius: 5, alignItems: "center" },
  accountButtonText: { color: "#4A70A9", fontWeight: "700" },

  row: {
    flexDirection: "row",
    gap: 20,
  },
  col: {
    flex: 1,
    minWidth: 280,

    width: "100%",
  },
  label: {
    fontWeight: "600",
    marginTop: 0,
    marginBottom: 4,
  },
  leftPanel: {
    width: "30%",
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
    height: "100%",
  },

  statusMessage: { fontSize: 12, color: "#67AA61", marginBottom: 10 },

  formTitle: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 2,
    textAlign: "left",
    fontFamily: "Montserrat-Bold",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 14,
    textAlign: "left",
    fontFamily: "Montserrat-Regular",
  },

  columnsWrapper: { justifyContent: "space-between", gap: 20 },
  column: { flex: 1, minWidth: 0, marginBottom: 20 },

  inputContainer: { marginBottom: 15, },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8, backgroundColor: "#fafafa", width: "100%",fontFamily: "Montserrat-Regular", },
  picker: { borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8, backgroundColor: "#fafafa", width: "100%",fontFamily: "Montserrat-Regular", fontSize: 16, },
  errorInput: { borderColor: "red" },
  errorText: { color: "red", marginTop: 4, marginBottom: 6, fontFamily: "Montserrat-Regular", },

  dateWrapper: { flexDirection: "row", alignItems: "center", padding: 12, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, backgroundColor: "#fafafa", marginBottom: 10 },
  webDateWrapper: { display: "flex", flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  webDateInput: { flex: 1, height: 50, padding: "0 12px", borderRadius: 8, border: "1px solid #ccc", backgroundColor: "#fafafa" },

  textArea: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 10,
    height: 135,
    textAlignVertical: "top",
  },
  imagePicker: { borderWidth: 1, borderColor: "#ccc", padding: 20, borderRadius: 10, alignItems: "center", backgroundColor: "#fafafa", height: 200, justifyContent: "center", marginBottom: 15, width: "100%" },
  imagePreview: { width: "100%", height: "100%", borderRadius: 10 },
  imageText: { color: "#666", fontFamily: "Montserrat-Regular", },

  submitButton: { backgroundColor: "#4A70A9", padding: 14, borderRadius: 50, alignItems: "center", marginTop: 10 },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});