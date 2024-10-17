// screens/AddExpenseScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal, FlatList } from 'react-native';
import axios from 'axios';

const AddExpenseScreen = ({ navigation, route }) => {
    // State to store form data
    const [expenseName, setExpenseName] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [id, setId] = useState(null);

    const { expense, isEdit } = route.params || {};

    const [dropdownVisible, setDropdownVisible] = useState(false);

    const categories = ['Food', 'Travel', 'Shopping', 'Health', 'Bills', 'Other'];

    // Replace 'localhost' with your machine's IP address if testing on a physical device
    const baseUrl = 'http://localhost:5000';

    useEffect(() => {
        if (expense) {
            const { id, name, amount, category } = expense;
            setId(id); // Set the ID of the existing expense
            setExpenseName(name);
            setAmount(amount.toString());
            setCategory(category);
        }
    }, [expense]);

    const handleSubmit = async () => {
        if (!expenseName || !amount || !category) {
            Alert.alert('Please fill all fields');
            return;
        }

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            Alert.alert('Please enter a valid amount');
            return;
        }

        // Prepare the expense object
        const expenseData = {
            name: expenseName,
            amount: parsedAmount,
            category,
        };

        try {
            if (id) {
                // Editing an existing expense
                const response = await axios.put(`${baseUrl}/expenses/${id}`, expenseData); // Update existing expense

                // Map _id to id
                const updatedExpense = {
                    ...response.data,
                    id: response.data._id, // Map _id to id
                };

                // Pass back the updated expense with the correct id
                navigation.navigate('Home', { newExpense: updatedExpense, isEdit: true });
            } else {
                // Adding a new expense
                const response = await axios.post(`${baseUrl}/expenses`, expenseData); // Add new expense

                // Map _id to id
                const newExpense = {
                    ...response.data,
                    id: response.data._id, // Map _id to id
                };

                // Pass back the new expense with the id from the backend
                navigation.navigate('Home', { newExpense: newExpense, isEdit: false }); // Pass expense to HomeScreen
            }
        } catch (error) {
            console.error('Error submitting expense:', error.response ? error.response.data : error.message);
            Alert.alert('Error', 'Failed to submit expense. Please try again.');
        }
    };

    const selectCategory = (item) => {
        setCategory(item);
        setDropdownVisible(false);
    };

    return (
        <View style={styles.container}>
            {/* Title */}
            <Text style={styles.title}>{isEdit ? 'Edit Expense' : 'Add New Expense'}</Text>

            {/* Expense Name Input */}
            <Text style={styles.label}>Expense Name</Text>
            <TextInput
                style={styles.input}
                value={expenseName}
                onChangeText={setExpenseName}
                placeholder="Enter expense name"
                placeholderTextColor="#aaa"
            />

            {/* Amount Input */}
            <Text style={styles.label}>Amount</Text>
            <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="Enter amount"
                keyboardType="numeric"
                placeholderTextColor="#aaa"
            />

            {/* Custom Category Dropdown */}
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity
                style={styles.input}
                onPress={() => setDropdownVisible(!dropdownVisible)}
            >
                <Text style={{ color: category ? '#333' : '#aaa' }}>
                    {category ? category : 'Select a category'}
                </Text>
            </TouchableOpacity>

            {dropdownVisible && (
                <View style={styles.dropdown}>
                    {categories.map((item) => (
                        <TouchableOpacity
                            key={item}
                            style={styles.dropdownItem}
                            onPress={() => selectCategory(item)}
                        >
                            <Text style={styles.dropdownItemText}>{item}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>{isEdit ? 'Update Expense' : 'Add Expense'}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#343a40',
        textAlign: 'center',
        marginBottom: 30,
    },
    label: {
        fontSize: 16,
        color: '#343a40',
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        color: '#333',
        marginBottom: 15,
        elevation: 1,
    },

    dropdown: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        backgroundColor: '#fff',
        marginBottom: 15,
        elevation: 1,
    },
    dropdownItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#333',
    },
    submitButton: {
        backgroundColor: '#006D5B',  // Teal Green
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
        elevation: 2,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default AddExpenseScreen;
