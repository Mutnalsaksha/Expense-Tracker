// HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Alert,
    SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import vector icons
import axios from 'axios'; // Import axios for HTTP requests

const HomeScreen = ({ navigation, route }) => {
    const [expenses, setExpenses] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All Categories'); // Default to 'All Categories'
    const [dropdownVisible, setDropdownVisible] = useState(false); // State for dropdown visibility

    // Replace 'localhost' with your machine's IP address if testing on a physical device
    const baseUrl = 'http://localhost:5000';

    // Fetch expenses from backend
    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const response = await axios.get(`${baseUrl}/expenses`);
                const mappedExpenses = response.data.map(expense => ({
                    ...expense,
                    id: expense._id // Map _id to id
                }));
                setExpenses(mappedExpenses);
                console.log('Mapped Expenses:', mappedExpenses); // Optional: Verify the mapping
            } catch (error) {
                console.error('Error fetching expenses:', error);
                Alert.alert('Error', 'Failed to fetch expenses. Please try again.');
            }
        };

        fetchExpenses(); // Fetch expenses on component mount
    }, []);

    // Handle new or edited expense from AddExpenseScreen
    useEffect(() => {
        if (route.params?.newExpense) {
            const { newExpense, isEdit } = route.params;

            if (isEdit) {
                // Update the existing expense in the state
                setExpenses(prevExpenses =>
                    prevExpenses.map((e) =>
                        e.id === newExpense.id ? newExpense : e
                    )
                );
                Alert.alert('Success', 'Expense updated successfully');
            } else {
                // Add the new expense to the state
                setExpenses(prevExpenses => [...prevExpenses, newExpense]);
                Alert.alert('Success', 'Expense added successfully');
            }

            // Optionally, reset the route.params to prevent duplicate handling
            navigation.setParams({ newExpense: null, isEdit: null });
        }
    }, [route.params?.newExpense]);

    // Function to delete expense
    const deleteExpense = async (id) => {
        try {
            await axios.delete(`${baseUrl}/expenses/${id}`); // Delete expense from backend
            setExpenses(expenses.filter((expense) => expense.id !== id)); // Use id here
            Alert.alert('Success', 'Expense deleted successfully'); // Optional: User feedback
        } catch (error) {
            console.error('Error deleting expense:', error);
            Alert.alert('Error', 'Failed to delete expense. Please try again.');
        }
    };

    const selectCategory = (item) => {
        setSelectedCategory(item);
        setDropdownVisible(false);
    };

    const categories = [
        'All Categories',
        'Food',
        'Travel',
        'Shopping',
        'Health',
        'Bills',
        'Other' // Added 'Other' for consistency with AddExpenseScreen
    ];

    const filteredExpenses = selectedCategory && selectedCategory !== 'All Categories'
        ? expenses.filter((expense) => expense.category === selectedCategory)
        : expenses;

    const getTotalExpenses = () => {
        return expenses.reduce((total, expense) => total + parseFloat(expense.amount), 0).toFixed(2);
    };

    const handleEdit = (expense) => {
        navigation.navigate('Add Expense', { expense, isEdit: true });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Expense Tracker</Text>
                    <Icon
                        name="cog"
                        size={24}
                        color="#6c757d"
                        onPress={() => navigation.navigate('Settings')}
                    />
                </View>

                {/* Total Expenses Overview */}
                <View style={styles.overviewContainer}>
                    <Text style={styles.overviewText}>Total Expenses This Month</Text>
                    <Text style={styles.totalAmount}>₹{getTotalExpenses()}</Text>
                </View>

                {/* Category Filter Dropdown */}
                <View style={styles.pickerContainer}>
                    <TouchableOpacity
                        style={styles.input}
                        onPress={() => setDropdownVisible(!dropdownVisible)}
                    >
                        <Text style={{ color: selectedCategory ? '#333' : '#aaa' }}>
                            {selectedCategory ? selectedCategory : 'Select a category'}
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
                </View>

                {/* Display filtered expenses */}
                <FlatList
                    data={filteredExpenses}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.expenseCard}>
                            <View style={styles.expenseContent}>
                                <Icon name="tag" size={20} color="#006D5B" />
                                <View style={styles.expenseInfo}>
                                    <Text style={styles.expenseName}>{item.name}</Text>
                                    <Text style={styles.expenseCategory}>{item.category}</Text>
                                    <Text style={styles.expenseDate}>
                                        {new Date(item.date).toLocaleDateString()}
                                    </Text>
                                </View>
                                <Text style={styles.expenseAmount}>₹{item.amount}</Text>

                                {/* Edit Button */}
                                <TouchableOpacity onPress={() => handleEdit(item)}>
                                    <Icon
                                        name="edit"
                                        size={20}
                                        color="#007bff"
                                        style={styles.icon}
                                    />
                                </TouchableOpacity>

                                {/* Delete Button */}
                                <TouchableOpacity onPress={() => deleteExpense(item.id)}>
                                    <Icon
                                        name="trash"
                                        size={20}
                                        color="#dc3545"
                                        style={styles.icon}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.emptyText}>No expenses in this category.</Text>}
                    contentContainerStyle={styles.flatListContent}
                />

                {/* Floating Action Button */}
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate('Add Expense')}
                >
                    <Icon name="plus" size={24} color="#fff" />
                </TouchableOpacity>

                {/* Text next to FAB */}
                <Text style={styles.fabLabel}>Add Expense</Text>
            </View>
        </SafeAreaView>
    );

};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#343a40',
    },
    overviewContainer: {
        backgroundColor: '#e9ecef',
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
    },
    overviewText: {
        fontSize: 18,
        color: '#6c757d',
        marginBottom: 10,
    },
    totalAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#006D5B',
    },
    pickerContainer: {
        marginBottom: 20,
        zIndex: 1, // Ensure dropdown appears above other elements
    },
    input: {
        fontSize: 18,
        color: '#333',
        backgroundColor: '#e9ecef', // Set background color to grey
        padding: 10, // Add padding to make it look consistent
        borderRadius: 10, // Add border radius for a rounded look
        fontWeight: '500', // Match with the text font weight
    },
    dropdown: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        backgroundColor: '#fff',
        marginTop: 5,
        maxHeight: 200, // Limit dropdown height
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
    expenseCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    expenseContent: {
        flexDirection: 'row',
        alignItems: 'center',
        // justifyContent: 'space-between', // Removed to align items properly
    },
    expenseInfo: {
        flex: 1,
        marginLeft: 10,
    },
    expenseName: {
        fontSize: 18,
        fontWeight: '500',
        color: '#343a40',
    },
    expenseCategory: {
        fontSize: 14,
        color: '#6c757d',
        fontStyle: 'italic',
    },
    expenseDate: {
        fontSize: 14,
        color: '#6c757d',
    },
    expenseAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ff0000',
        marginRight: 15,
    },
    icon: {
        marginLeft: 15, // Spacing between icons
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 18,
        color: '#6c757d',
        marginTop: 20,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 30,
        backgroundColor: '#006D5B',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2.5,
        zIndex: 10, // Ensure FAB is above other elements
    },
    fabLabel: {
        position: 'absolute',
        right: 90,  // Adjusted to position the text beside the button
        bottom: 50,  // Adjusted to align text above the FAB button
        fontSize: 16,
        color: '#006D5B',
        fontWeight: '600',
    },
    flatListContent: {
        paddingBottom: 100, // Ensure enough space for FAB
    },
});

export default HomeScreen;
