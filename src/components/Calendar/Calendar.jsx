import React, { useState, useCallback, useEffect } from 'react';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import TodoModal from '../Todo/TodoModal';
import { useCalendar } from '../../hooks/useCalendar';
import { useTodos } from '../../hooks/useTodos';
import { formatDateKey } from '../../utils/dateUtils';

/**
 * Calendar component - Main container that orchestrates the calendar view
 * @param {object} props - Component props
 * @param {string} props.className - Additional CSS classes (optional)
 * @param {boolean} props.showWeekNumbers - Whether to show week numbers (optional)
 * @param {function} props.onDateSelect - Callback when a date is selected (optional)
 */
const Calendar = ({ 
  className = '',
  showWeekNumbers = false,
  onDateSelect
}) => {
  // Calendar state management
  const {
    currentDate,
    selectedDate,
    goToPrevMonth,
    goToNextMonth,
    selectDate,
    goToToday
  } = useCalendar();

  // Todo state management
  const {
    todos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodoComplete,
    isLoading,
    error
  } = useTodos();

  // Local state
  const [showTodoModal, setShowTodoModal] = useState(false);
  const [operationStatus, setOperationStatus] = useState({
    loading: false,
    error: null,
    success: false,
    action: null
  });

  // Reset operation status when modal closes
  useEffect(() => {
    if (!showTodoModal) {
      setOperationStatus({
        loading: false,
        error: null,
        success: false,
        action: null
      });
    }
  }, [showTodoModal]);

  // Handle date selection from calendar
  const handleDateClick = useCallback((date) => {
    selectDate(date);
    setShowTodoModal(true);
    
    // Call external handler if provided
    if (onDateSelect) {
      onDateSelect(date);
    }
  }, [selectDate, onDateSelect]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setShowTodoModal(false);
  }, []);

  // Handle todo operations from modal
  const handleTodoUpdate = useCallback(async (action, todoId, todoData) => {
    setOperationStatus({
      loading: true,
      error: null,
      success: false,
      action
    });
    
    try {
      let result;
      
      // Validate selectedDate before using it
      if (action === 'add' && !selectedDate) {
        throw new Error('No date selected for adding todo');
      }
      
      switch (action) {
        case 'add':
          // Ensure the todo has the correct dateKey
          result = await addTodo({
            ...todoData,
            dateKey: selectedDate ? formatDateKey(selectedDate) : null
          });
          break;
        case 'update':
          result = await updateTodo(todoId, todoData);
          break;
        case 'delete':
          result = await deleteTodo(todoId);
          break;
        case 'toggle':
          result = await toggleTodoComplete(todoId);
          break;
        default: {
          const error = new Error(`Unknown todo action: ${action}`);
          console.error('Invalid todo action:', action);
          setOperationStatus({
            loading: false,
            error: error.message,
            success: false,
            action
          });
          throw error;
        }
      }
      
      setOperationStatus({
        loading: false,
        error: null,
        success: true,
        action,
        result
      });
      
      return result;
    } catch (error) {
      console.error(`Failed to ${action} todo:`, error);
      
      setOperationStatus({
        loading: false,
        error: error.message || `Failed to ${action} todo`,
        success: false,
        action
      });
      
      // Don't re-throw or return rejected promise, just handle the error gracefully
      // The error is already set in operationStatus state
    }
  }, [addTodo, updateTodo, deleteTodo, toggleTodoComplete, selectedDate]);

  // Get todos for the selected date
  const selectedDateTodos = selectedDate ? (todos[formatDateKey(selectedDate)] || []) : [];

  return (
    <div className={`w-full max-w-6xl mx-auto ${className}`}>
      {/* Calendar Container */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Calendar Header */}
        <CalendarHeader
          currentDate={currentDate}
          onPrevMonth={goToPrevMonth}
          onNextMonth={goToNextMonth}
          onTodayClick={goToToday}
          showToday={true}
          disabled={isLoading || operationStatus.loading}
        />

        {/* Calendar Grid */}
        <CalendarGrid
          currentDate={currentDate}
          todos={todos}
          onDateClick={handleDateClick}
          selectedDate={selectedDate}
          showWeekNumbers={showWeekNumbers}
          disabled={isLoading || operationStatus.loading}
        />
      </div>

      {/* Todo Modal */}
      <TodoModal
        isOpen={showTodoModal}
        onClose={handleModalClose}
        selectedDate={selectedDate}
        todos={selectedDateTodos}
        onTodoUpdate={handleTodoUpdate}
        isLoading={isLoading || operationStatus.loading}
        error={error || operationStatus.error}
        operationStatus={operationStatus}
      />

      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite" id="calendar-announcements">
        {selectedDate && `Selected date: ${selectedDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        })}`}
        {operationStatus.success && (
          <span>
            {operationStatus.action === 'add' && 'Todo added successfully.'}
            {operationStatus.action === 'update' && 'Todo updated successfully.'}
            {operationStatus.action === 'delete' && 'Todo deleted successfully.'}
            {operationStatus.action === 'toggle' && 'Todo status toggled successfully.'}
          </span>
        )}
        {operationStatus.error && (
          <span>Error: {operationStatus.error}</span>
        )}
      </div>
    </div>
  );
};

export default Calendar;