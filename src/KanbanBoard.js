import React, { useState, useEffect, useRef } from 'react';
import './KanbanBoard.css';

// Importing icons from the src/icons folder
import displayIcon from './icons/Display.svg';
import downIcon from './icons/down.svg';
import todoIcon from './icons/To-do.svg';
import inProgressIcon from './icons/in-progress.svg';
import doneIcon from './icons/Done.svg';
import cancelledIcon from './icons/Cancelled.svg';
import addIcon from './icons/add.svg';
import menuIcon from './icons/3 dot menu.svg';
import userIcon from './icons/random-user-avatar.svg'; // Default user icon
import urgentIcon from './icons/SVG - Urgent Priority colour.svg';
import highIcon from './icons/Img - High Priority.svg';
import mediumIcon from './icons/Img - Medium Priority.svg';
import lowIcon from './icons/Img - Low Priority.svg';
import noPriorityIcon from './icons/No-priority.svg';
import backlogIcon from './icons/Backlog.svg';

const KanbanBoard = () => {
    const [tickets, setTickets] = useState([]);
    const [groupBy, setGroupBy] = useState(localStorage.getItem('groupBy') || 'status');
    const [sortBy, setSortBy] = useState(localStorage.getItem('sortBy') || 'priority');
    const [showDisplayMenu, setShowDisplayMenu] = useState(false);
    const displayMenuRef = useRef(null); // Reference to the display menu

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://api.quicksell.co/v1/internal/frontend-assignment');
                const data = await response.json();
                setTickets(data.tickets);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        localStorage.setItem('groupBy', groupBy);
        localStorage.setItem('sortBy', sortBy);
    }, [groupBy, sortBy]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (displayMenuRef.current && !displayMenuRef.current.contains(event.target)) {
                setShowDisplayMenu(false);
            }
        };

        // Add event listener for outside click
        document.addEventListener('mousedown', handleClickOutside);

        // Clean up the event listener on component unmount
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const groupTickets = () => {
        const priorityMap = {
            4: 'Urgent',
            3: 'High',
            2: 'Medium',
            1: 'Low',
            0: 'No priority'
        };

        switch (groupBy) {
            case 'status': {
                const orderedStatuses = ['Todo', 'In progress', 'Done', 'Cancelled', 'Backlog']; // Added 'Backlog'
                const grouped = tickets.reduce((acc, ticket) => {
                    const normalizedStatus = normalizeStatus(ticket.status);

                    // Group "Backlog" as "Done", and add tickets to both Done and Backlog sections
                    if (normalizedStatus === 'Backlog') {
                        acc['Done'] = [...(acc['Done'] || []), ticket];
                        acc['Backlog'] = [...(acc['Backlog'] || []), ticket]; // Duplicate ticket in Backlog
                    } else {
                        acc[normalizedStatus] = [...(acc[normalizedStatus] || []), ticket];
                    }

                    return acc;
                }, {});

                return orderedStatuses.reduce((acc, status) => {
                    acc[status] = grouped[status] || [];
                    return acc;
                }, {});
            }
            case 'user': {
                return tickets.reduce((acc, ticket) => {
                    const user = ticket.userId ? `User ${ticket.userId}` : 'Unassigned';
                    acc[user] = [...(acc[user] || []), ticket];
                    return acc;
                }, {});
            }
            case 'priority': {
                return tickets.reduce((acc, ticket) => {
                    const priority = priorityMap[ticket.priority] || 'No priority';
                    acc[priority] = [...(acc[priority] || []), ticket];
                    return acc;
                }, {});
            }
            default:
                return {};
        }
    };

    const sortTickets = (tickets) => {
        if (sortBy === 'priority') {
            return tickets.sort((a, b) => b.priority - a.priority);
        }
        return tickets.sort((a, b) => a.title.localeCompare(b.title));
    };

    const normalizeStatus = (status) => {
        switch (status.toLowerCase()) {
            case 'todo':
                return 'Todo';
            case 'in-progress':
                return 'In progress';
            case 'backlog':
                return 'Backlog'; // Treat 'Backlog' as its own category initially
            case 'cancelled':
                return 'Cancelled';
            default:
                return status;
        }
    };

    // Modified function to get the correct icon based on grouping type
    const getIcon = (group) => {
        if (groupBy === 'status') {
            switch (group) {
                case 'Todo':
                    return todoIcon;
                case 'In progress':
                    return inProgressIcon;
                case 'Done':
                    return doneIcon;
                case 'Backlog':
                    return backlogIcon;
                case 'Cancelled':
                    return cancelledIcon;
                default:
                    return null;
            }
        }

        if (groupBy === 'user') {
            return userIcon; // Default user icon for user grouping
        }

        if (groupBy === 'priority') {
            switch (group) {
                case 'Urgent':
                    return urgentIcon;
                case 'High':
                    return highIcon;
                case 'Medium':
                    return mediumIcon;
                case 'Low':
                    return lowIcon;
                case 'No priority':
                    return noPriorityIcon;
                default:
                    return null;
            }
        }

        return null; // Default fallback icon
    };

    // Helper function to get the priority icon
    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 4: return urgentIcon;
            case 3: return highIcon;
            case 2: return mediumIcon;
            case 1: return lowIcon;
            default: return noPriorityIcon;
        }
    };

    const groupedTickets = groupTickets();

    return (
        <div className="kanban-container">
            <div className="display-controls">
                <button
                    className="display-toggle"
                    onClick={() => setShowDisplayMenu(!showDisplayMenu)}
                >
                    <img src={displayIcon} alt="Display Icon" className="display-icon" />
                    Display
                    <img
                        src={downIcon}
                        alt="Down Icon"
                        className={`down-icon ${showDisplayMenu ? 'rotated' : ''}`}
                    />
                </button>

                {showDisplayMenu && (
                    <div ref={displayMenuRef} className="display-menu">
                        <div className="grouping-container">
                            <label htmlFor="grouping">Grouping:</label>
                            <select
                                id="grouping"
                                value={groupBy}
                                onChange={(e) => setGroupBy(e.target.value)}
                            >
                                <option value="status">Status</option>
                                <option value="user">User</option>
                                <option value="priority">Priority</option>
                            </select>
                        </div>

                        <div className="ordering-container">
                            <label htmlFor="ordering">Ordering:</label>
                            <select
                                id="ordering"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="priority">Priority</option>
                                <option value="title">Title</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            <div className="kanban-board">
                {Object.entries(groupedTickets).map(([group, tickets]) => (
                    <div key={group} className="kanban-column">
                        <div className="column-header">
                            <div className="status-info">
                                <img src={getIcon(group)} alt={group} className="status-icon" />
                                <span>{group}</span>
                                <span className="ticket-count">{tickets.length}</span>
                            </div>
                            <div className="icons">
                                <img src={addIcon} alt="Add Icon" className="add-icon" />
                                <img src={menuIcon} alt="Menu Icon" className="menu-icon" />
                            </div>
                        </div>
                        <div className="ticket-list">
                            {sortTickets(tickets).map((ticket) => (
                                <div key={ticket.id} className="ticket-card">
                                    <div className="ticket-header">
                                        <span className="ticket-id">{ticket.id}</span>
                                    </div>
                                    <h3 className="ticket-title">{ticket.title}</h3>
                                    <div className="ticket-tags">
                                        {/* Conditionally hide priority icon when grouping by "priority" */}
                                        {groupBy !== 'priority' && (
                                            <img src={getPriorityIcon(ticket.priority)} alt="Priority" className="priority-icon" />
                                        )}
                                        {ticket.tag.map((tag) => (
                                            <span key={tag} className="ticket-tag">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default KanbanBoard;
