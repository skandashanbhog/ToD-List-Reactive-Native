import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Keyboard,
  useColorScheme,
  Appearance,  // <-- Import Appearance API
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [task, setTask] = useState('');
  const [taskList, setTaskList] = useState([]);
  
  // Get the system theme using Appearance API (both web and mobile)
  const systemTheme = Appearance.getColorScheme(); // This works for both Expo Go and web
  const colorScheme = useColorScheme(); // This is for React Native's built-in theme detection
  
  // Use the system theme as fallback
  const isDarkMode = colorScheme === 'dark' || systemTheme === 'dark';

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const tasks = await AsyncStorage.getItem('tasks');
      if (tasks !== null) {
        setTaskList(JSON.parse(tasks));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveTasks = async (tasks) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (e) {
      console.error(e);
    }
  };

  const addTask = () => {
    if (task.trim() === '') return;

    const newTasks = [
      ...taskList,
      { id: Date.now().toString(), text: task, completed: false },
    ];
    setTaskList(newTasks);
    saveTasks(newTasks);
    setTask('');
    Keyboard.dismiss();
  };

  const toggleComplete = (id) => {
    const updatedTasks = taskList.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setTaskList(updatedTasks);
    saveTasks(updatedTasks);
  };

  const deleteTask = (id) => {
    const filtered = taskList.filter((item) => item.id !== id);
    setTaskList(filtered);
    saveTasks(filtered);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => toggleComplete(item.id)}
      onLongPress={() => deleteTask(item.id)}
      style={[
        styles.taskItem,
        {
          backgroundColor: isDarkMode ? '#333' : '#FFF',
          borderColor: isDarkMode ? '#555' : '#DDD',
        },
        item.completed && {
          backgroundColor: isDarkMode ? '#000000' : '#d4edda',
        },
      ]}
    >
      <Text
        style={[
          styles.taskText,
          {
            color: isDarkMode ? '#FFF' : '#000',
            textDecorationLine: item.completed ? 'line-through' : 'none',
          },
        ]}
      >
        {item.text}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#000000' : '#F0F0F0' },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>To-Do List</Text>
      </View>
      <FlatList
        data={taskList}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={styles.list}
      />
      <View style={styles.inputContainer}>
        <TextInput
          value={task}
          onChangeText={setTask}
          placeholder="Enter a task"
          placeholderTextColor={isDarkMode ? '#AAA' : '#888'}
          style={[
            styles.input,
            {
              backgroundColor: isDarkMode ? '#1E1E1E' : '#FFF',
              color: isDarkMode ? '#FFF' : '#000',
            },
          ]}
        />
        <TouchableOpacity
          onPress={addTask}
          style={[
            styles.addButton,
            { backgroundColor: isDarkMode ? '#FFA500' : '#FFA500' },
          ]}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    backgroundColor: 'orange',
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  list: {
    flex: 1,
    marginBottom: 20,
  },
  taskItem: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  taskText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  input: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    fontSize: 16,
  },
  addButton: {
    marginLeft: 10,
    borderRadius: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 24,
    color: '#FFF',
  },
});
