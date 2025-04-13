document.addEventListener('DOMContentLoaded', function() {
    // Sample data for the hotel management system
    let rooms = [
        { id: 1, number: '101', type: 'single', price: 100, status: 'available', description: 'Standard single room' },
        { id: 2, number: '102', type: 'double', price: 150, status: 'available', description: 'Standard double room' },
        { id: 3, number: '201', type: 'suite', price: 250, status: 'occupied', description: 'Luxury suite with view' },
        { id: 4, number: '202', type: 'deluxe', price: 300, status: 'maintenance', description: 'Deluxe room with balcony' }
    ];

    let guests = [
        { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '1234567890', address: '123 Main St', country: 'USA', vipStatus: 'regular', notes: '' },
        { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', phone: '9876543210', address: '456 Oak Ave', country: 'Canada', vipStatus: 'gold', notes: 'Prefers upper floor' }
    ];

    let bookings = [
        { id: 1, guestId: 1, roomId: 3, checkIn: '2023-06-15', checkOut: '2023-06-20', status: 'checked-in', specialRequests: 'Extra towels please' },
        { id: 2, guestId: 2, roomId: 1, checkIn: '2023-06-25', checkOut: '2023-06-30', status: 'confirmed', specialRequests: '' }
    ];

    let staff = [
        { id: 1, name: 'Robert Johnson', position: 'Manager', email: 'robert@hotel.com', phone: '555-0101' },
        { id: 2, name: 'Maria Garcia', position: 'Receptionist', email: 'maria@hotel.com', phone: '555-0102' },
        { id: 3, name: 'David Lee', position: 'Housekeeping', email: 'david@hotel.com', phone: '555-0103' },
        { id: 4, name: 'Vikash Rajput', position: 'Manager', email: 'vikashraj@hotel.com', phone: '5585-0103' }
    ];

    // DOM Elements
    const navLinks = document.querySelectorAll('nav a');
    const contentSections = document.querySelectorAll('.content-section');
    
    // Modal elements
    const roomModal = document.getElementById('room-modal');
    const bookingModal = document.getElementById('booking-modal');
    const guestModal = document.getElementById('guest-modal');
    const confirmationModal = document.getElementById('confirmation-modal');
    const closeButtons = document.querySelectorAll('.close');
    
    // Form elements
    const roomForm = document.getElementById('room-form');
    const bookingForm = document.getElementById('booking-form');
    const guestForm = document.getElementById('guest-form');
    
    // Buttons
    const addRoomBtn = document.getElementById('add-room-btn');
    const addBookingBtn = document.getElementById('add-booking-btn');
    const addGuestBtn = document.getElementById('add-guest-btn');
    
    // Confirmation modal buttons
    const confirmYesBtn = document.getElementById('confirm-yes');
    const confirmNoBtn = document.getElementById('confirm-no');
    
    // Current item to be deleted
    let currentItemToDelete = null;
    let currentDeleteCallback = null;

    // Initialize the app
    init();

    function init() {
        // Set up event listeners
        setupEventListeners();
        
        // Load initial data
        updateDashboard();
        loadRooms();
        loadBookings();
        loadGuests();
        loadStaff();
        
        // Set today's date as default for date inputs
        setDefaultDates();
    }

    function setupEventListeners() {
        // Navigation
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const sectionId = this.getAttribute('data-section');
                
                // Update active nav link
                navLinks.forEach(navLink => navLink.classList.remove('active'));
                this.classList.add('active');
                
                // Show corresponding section  
                contentSections.forEach(section => {
                    section.classList.remove('active');
                    if (section.id === sectionId) {
                        section.classList.add('active');
                        
                        // Refresh data when section is shown
                        if (sectionId === 'dashboard') updateDashboard();
                        if (sectionId === 'rooms') loadRooms();
                        if (sectionId === 'bookings') loadBookings();
                        if (sectionId === 'guests') loadGuests();
                        if (sectionId === 'staff') loadStaff();
                        if (sectionId === 'reports') generateReport();
                    }
                });
            });
        });

        // Modal close buttons
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                roomModal.style.display = 'none';
                bookingModal.style.display = 'none';
                guestModal.style.display = 'none';
                confirmationModal.style.display = 'none';
            });
        });

        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === roomModal) roomModal.style.display = 'none';
            if (e.target === bookingModal) bookingModal.style.display = 'none';
            if (e.target === guestModal) guestModal.style.display = 'none';
            if (e.target === confirmationModal) confirmationModal.style.display = 'none';
        });

        // Add room button
        addRoomBtn.addEventListener('click', function() {
            document.getElementById('room-modal-title').textContent = 'Add New Room';
            document.getElementById('room-id').value = '';
            roomForm.reset();
            roomModal.style.display = 'flex';
        });

        // Add booking button
        addBookingBtn.addEventListener('click', function() {
            document.getElementById('booking-modal-title').textContent = 'New Booking';
            document.getElementById('booking-id').value = '';
            bookingForm.reset();
            
            // Populate guest and room dropdowns
            populateGuestDropdown();
            populateRoomDropdown();
            
            bookingModal.style.display = 'flex';
        });

        // Add guest button
        addGuestBtn.addEventListener('click', function() {
            document.getElementById('guest-modal-title').textContent = 'Add New Guest';
            document.getElementById('guest-id').value = '';
            guestForm.reset();
            guestModal.style.display = 'flex';
        });

        // Room form submission
        roomForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveRoom();
        });

        // Booking form submission
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveBooking();
        });

        // Guest form submission
        guestForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveGuest();
        });

        // Confirmation modal buttons
        confirmYesBtn.addEventListener('click', function() {
            if (currentItemToDelete && currentDeleteCallback) {
                currentDeleteCallback(currentItemToDelete);
            }
            confirmationModal.style.display = 'none';
        });

        confirmNoBtn.addEventListener('click', function() {
            confirmationModal.style.display = 'none';
        });

        // Room filters
        document.getElementById('room-type-filter').addEventListener('change', loadRooms);
        document.getElementById('room-status-filter').addEventListener('change', loadRooms);

        // Booking filters
        document.getElementById('booking-date-filter').addEventListener('change', loadBookings);
        document.getElementById('booking-status-filter').addEventListener('change', loadBookings);

        // Guest search
        document.getElementById('search-guest-btn').addEventListener('click', loadGuests);

        // Report generation
        document.getElementById('generate-report-btn').addEventListener('click', generateReport);
    }

    function setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('check-in-date').value = today;
        document.getElementById('check-out-date').min = today;
        
        // Set report dates to current month
        const firstDay = new Date();
        firstDay.setDate(1);
        document.getElementById('report-start-date').value = firstDay.toISOString().split('T')[0];
        
        const lastDay = new Date();
        lastDay.setMonth(lastDay.getMonth() + 1);
        lastDay.setDate(0);
        document.getElementById('report-end-date').value = lastDay.toISOString().split('T')[0];
    }

    // Dashboard functions
    function updateDashboard() {
        // Calculate stats
        const totalRooms = rooms.length;
        const availableRooms = rooms.filter(room => room.status === 'available').length;
        const occupiedRooms = rooms.filter(room => room.status === 'occupied').length;
        
        const today = new Date().toISOString().split('T')[0];
        const todayCheckins = bookings.filter(booking => booking.checkIn === today && (booking.status === 'confirmed' || booking.status === 'checked-in')).length;
        
        // Update stats
        document.getElementById('total-rooms').textContent = totalRooms;
        document.getElementById('available-rooms').textContent = availableRooms;
        document.getElementById('occupied-rooms').textContent = occupiedRooms;
        document.getElementById('today-checkins').textContent = todayCheckins;
        
        // Load recent bookings
        loadRecentBookings();
    }

    function loadRecentBookings() {
        const tbody = document.querySelector('#recent-bookings tbody');
        tbody.innerHTML = '';
        
        // Sort bookings by check-in date (newest first)
        const sortedBookings = [...bookings].sort((a, b) => new Date(b.checkIn) - new Date(a.checkIn));
        
        // Show only the 5 most recent bookings
        const recentBookings = sortedBookings.slice(0, 5);
        
        recentBookings.forEach(booking => {
            const guest = guests.find(g => g.id === booking.guestId);
            const room = rooms.find(r => r.id === booking.roomId);
            
            if (guest && room) {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${booking.id}</td>
                    <td>${guest.firstName} ${guest.lastName}</td>
                    <td>${room.number}</td>
                    <td>${formatDate(booking.checkIn)}</td>
                    <td>${formatDate(booking.checkOut)}</td>
                    <td><span class="status status-${booking.status}">${booking.status}</span></td>
                `;
                
                tbody.appendChild(row);
            }
        });
    }

    // Room management functions
    function loadRooms() {
        const tbody = document.querySelector('#rooms-table tbody');
        tbody.innerHTML = '';
        
        // Get filter values
        const typeFilter = document.getElementById('room-type-filter').value;   
        const statusFilter = document.getElementById('room-status-filter').value;
        
        // Filter rooms
        let filteredRooms = [...rooms];
        
        if (typeFilter !== 'all') {
            filteredRooms = filteredRooms.filter(room => room.type === typeFilter);
        }
        
        if (statusFilter !== 'all') {
            filteredRooms = filteredRooms.filter(room => room.status === statusFilter);
        }
        
        // Populate table
        filteredRooms.forEach(room => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${room.number}</td>
                <td>${capitalizeFirstLetter(room.type)}</td>
                <td>$${room.price}</td>
                <td><span class="status status-${room.status}">${room.status}</span></td>
                <td>
                    <button class="action-btn edit-btn" data-id="${room.id}"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" data-id="${room.id}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const roomId = parseInt(this.getAttribute('data-id'));
                editRoom(roomId);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const roomId = parseInt(this.getAttribute('data-id'));
                showDeleteConfirmation(roomId, deleteRoom);
            });
        });
    }

    function editRoom(roomId) {
        const room = rooms.find(r => r.id === roomId);
        if (room) {
            document.getElementById('room-modal-title').textContent = 'Edit Room';
            document.getElementById('room-id').value = room.id;
            document.getElementById('room-number').value = room.number;
            document.getElementById('room-type').value = room.type;
            document.getElementById('room-price').value = room.price;
            document.getElementById('room-status').value = room.status;
            document.getElementById('room-description').value = room.description;
            
            roomModal.style.display = 'flex';
        }
    }

    function saveRoom() {
        const roomId = document.getElementById('room-id').value;
        const roomData = {
            number: document.getElementById('room-number').value,
            type: document.getElementById('room-type').value,
            price: parseFloat(document.getElementById('room-price').value),
            status: document.getElementById('room-status').value,
            description: document.getElementById('room-description').value
        };
        
        if (roomId) {
            // Update existing room
            const index = rooms.findIndex(r => r.id === parseInt(roomId));
            if (index !== -1) {
                rooms[index] = { ...rooms[index], ...roomData };
            }
        } else {
            // Add new room
            const newId = rooms.length > 0 ? Math.max(...rooms.map(r => r.id)) + 1 : 1;
            rooms.push({ id: newId, ...roomData });
        }
        
        roomModal.style.display = 'none';
        loadRooms();
        updateDashboard();
    }

    function showDeleteConfirmation(itemId, callback) {
        currentItemToDelete = itemId;
        currentDeleteCallback = callback;
        confirmationModal.style.display = 'flex';
    }

    function deleteRoom(roomId) {
        rooms = rooms.filter(room => room.id !== roomId);
        loadRooms();
        updateDashboard();
    }

    // Booking management functions
    function loadBookings() {
        const tbody = document.querySelector('#bookings-table tbody');
        tbody.innerHTML = '';
        
        // Get filter values
        const dateFilter = document.getElementById('booking-date-filter').value;
        const statusFilter = document.getElementById('booking-status-filter').value;
        
        // Filter bookings
        let filteredBookings = [...bookings];
        
        if (dateFilter) {
            filteredBookings = filteredBookings.filter(booking => 
                booking.checkIn === dateFilter || booking.checkOut === dateFilter
            );
        }
        
        if (statusFilter !== 'all') {
            filteredBookings = filteredBookings.filter(booking => booking.status === statusFilter);
        }
        
        // Populate table
        filteredBookings.forEach(booking => {
            const guest = guests.find(g => g.id === booking.guestId);
            const room = rooms.find(r => r.id === booking.roomId);
            
            if (guest && room) {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${booking.id}</td>
                    <td>${guest.firstName} ${guest.lastName}</td>
                    <td>${room.number}</td>
                    <td>${formatDate(booking.checkIn)}</td>
                    <td>${formatDate(booking.checkOut)}</td>
                    <td><span class="status status-${booking.status}">${booking.status}</span></td>
                    <td>
                        <button class="action-btn edit-btn" data-id="${booking.id}"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete-btn" data-id="${booking.id}"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                
                tbody.appendChild(row);
            }
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const bookingId = parseInt(this.getAttribute('data-id'));
                editBooking(bookingId);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const bookingId = parseInt(this.getAttribute('data-id'));
                showDeleteConfirmation(bookingId, deleteBooking);
            });
        });
    }

    function populateGuestDropdown() {
        const select = document.getElementById('booking-guest');
        select.innerHTML = '';
        
        guests.forEach(guest => {
            const option = document.createElement('option');
            option.value = guest.id;
            option.textContent = `${guest.firstName} ${guest.lastName}`;
            select.appendChild(option);
        });
    }

    function populateRoomDropdown() {
        const select = document.getElementById('booking-room');
        select.innerHTML = '';
        
        const availableRooms = rooms.filter(room => room.status === 'available');
        
        availableRooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room.id;
            option.textContent = `${room.number} (${capitalizeFirstLetter(room.type)} - $${room.price})`;
            select.appendChild(option);
        });
    }

    function editBooking(bookingId) {
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) {
            document.getElementById('booking-modal-title').textContent = 'Edit Booking';
            document.getElementById('booking-id').value = booking.id;
            
            // Populate dropdowns
            populateGuestDropdown();
            populateRoomDropdown();
            
            // Set values
            document.getElementById('booking-guest').value = booking.guestId;
            document.getElementById('booking-room').value = booking.roomId;
            document.getElementById('check-in-date').value = booking.checkIn;
            document.getElementById('check-out-date').value = booking.checkOut;
            document.getElementById('booking-status').value = booking.status;
            document.getElementById('special-requests').value = booking.specialRequests;
            
            bookingModal.style.display = 'flex';
        }
    }

    function saveBooking() {
        const bookingId = document.getElementById('booking-id').value;
        const bookingData = {
            guestId: parseInt(document.getElementById('booking-guest').value),
            roomId: parseInt(document.getElementById('booking-room').value),
            checkIn: document.getElementById('check-in-date').value,
            checkOut: document.getElementById('check-out-date').value,
            status: document.getElementById('booking-status').value,
            specialRequests: document.getElementById('special-requests').value
        };
        
        if (bookingId) {
            // Update existing booking
            const index = bookings.findIndex(b => b.id === parseInt(bookingId));
            if (index !== -1) {
                bookings[index] = { ...bookings[index], ...bookingData };
                
                // Update room status if needed
                if (bookingData.status === 'checked-in') {
                    const roomIndex = rooms.findIndex(r => r.id === bookingData.roomId);
                    if (roomIndex !== -1) {
                        rooms[roomIndex].status = 'occupied';
                    }
                }
            }
        } else {
            // Add new booking
            const newId = bookings.length > 0 ? Math.max(...bookings.map(b => b.id)) + 1 : 1;
            bookings.push({ id: newId, ...bookingData });
            
            // Update room status if checked-in
            if (bookingData.status === 'checked-in') {
                const roomIndex = rooms.findIndex(r => r.id === bookingData.roomId);
                if (roomIndex !== -1) {
                    rooms[roomIndex].status = 'occupied';
                }
            }
        }
        
        bookingModal.style.display = 'none';
        loadBookings();
        loadRooms();
        updateDashboard();
    }

    function deleteBooking(bookingId) {
        bookings = bookings.filter(booking => booking.id !== bookingId);
        loadBookings();
        updateDashboard();
    }

    // Guest management functions
    function loadGuests() {
        const tbody = document.querySelector('#guests-table tbody');
        tbody.innerHTML = '';
        
        // Get search term
        const searchTerm = document.getElementById('guest-search').value.toLowerCase();
        
        // Filter guests
        let filteredGuests = [...guests];
        
        if (searchTerm) {
            filteredGuests = filteredGuests.filter(guest => 
                guest.firstName.toLowerCase().includes(searchTerm) || 
                guest.lastName.toLowerCase().includes(searchTerm) ||
                guest.email.toLowerCase().includes(searchTerm) ||
                guest.phone.includes(searchTerm)
            );
        }
        
        // Populate table
        filteredGuests.forEach(guest => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${guest.id}</td>
                <td>${guest.firstName} ${guest.lastName}</td>
                <td>${guest.email}</td>
                <td>${guest.phone}</td>
                <td>${capitalizeFirstLetter(guest.vipStatus)}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${guest.id}"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" data-id="${guest.id}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const guestId = parseInt(this.getAttribute('data-id'));
                editGuest(guestId);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const guestId = parseInt(this.getAttribute('data-id'));
                showDeleteConfirmation(guestId, deleteGuest);
            });
        });
    }

    function editGuest(guestId) {
        const guest = guests.find(g => g.id === guestId);
        if (guest) {
            document.getElementById('guest-modal-title').textContent = 'Edit Guest';
            document.getElementById('guest-id').value = guest.id;
            document.getElementById('guest-first-name').value = guest.firstName;
            document.getElementById('guest-last-name').value = guest.lastName;
            document.getElementById('guest-email').value = guest.email;
            document.getElementById('guest-phone').value = guest.phone;
            document.getElementById('guest-address').value = guest.address || '';
            document.getElementById('guest-country').value = guest.country || '';
            document.getElementById('guest-vip').value = guest.vipStatus;
            document.getElementById('guest-notes').value = guest.notes || '';
            
            guestModal.style.display = 'flex';
        }
    }

    function saveGuest() {
        const guestId = document.getElementById('guest-id').value;
        const guestData = {
            firstName: document.getElementById('guest-first-name').value,
            lastName: document.getElementById('guest-last-name').value,
            email: document.getElementById('guest-email').value,
            phone: document.getElementById('guest-phone').value,
            address: document.getElementById('guest-address').value,
            country: document.getElementById('guest-country').value,
            vipStatus: document.getElementById('guest-vip').value,
            notes: document.getElementById('guest-notes').value
        };
        
        if (guestId) {
            // Update existing guest
            const index = guests.findIndex(g => g.id === parseInt(guestId));
            if (index !== -1) {
                guests[index] = { ...guests[index], ...guestData };
            }
        } else {
            // Add new guest
            const newId = guests.length > 0 ? Math.max(...guests.map(g => g.id)) + 1 : 1;
            guests.push({ id: newId, ...guestData });
        }
        
        guestModal.style.display = 'none';
        loadGuests();
    }

    function deleteGuest(guestId) {
        guests = guests.filter(guest => guest.id !== guestId);
        loadGuests();
    }

    // Staff management functions
    function loadStaff() {
        const tbody = document.querySelector('#staff-table tbody');
        tbody.innerHTML = '';
        
        staff.forEach(staffMember => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${staffMember.id}</td>
                <td>${staffMember.name}</td>
                <td>${staffMember.position}</td>
                <td>${staffMember.email}</td>
                <td>${staffMember.phone}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${staffMember.id}"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" data-id="${staffMember.id}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    // Report functions
    function generateReport() {
        const reportType = document.getElementById('report-type').value;
        const startDate = document.getElementById('report-start-date').value;
        const endDate = document.getElementById('report-end-date').value;
        
        const ctx = document.getElementById('report-chart').getContext('2d');
        
        // Destroy previous chart if it exists
        if (window.reportChart) {
            window.reportChart.destroy();
        }
        
        let chartData = {};
        let reportText = '';
        
        switch(reportType) {
            case 'occupancy':
                chartData = getOccupancyData(startDate, endDate);
                reportText = generateOccupancyReport(chartData);
                break;
            case 'revenue':
                chartData = getRevenueData(startDate, endDate);
                reportText = generateRevenueReport(chartData);
                break;
            case 'guest':
                chartData = getGuestData(startDate, endDate);
                reportText = generateGuestReport(chartData);
                break;
        }
        
        // Create chart
        window.reportChart = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: `${capitalizeFirstLetter(reportType)} Report (${formatDate(startDate)} to ${formatDate(endDate)})`
                    }
                }
            }
        });
        
        // Display report text
        document.getElementById('report-data').innerHTML = reportText;
    }

    function getOccupancyData(startDate, endDate) {
        const filteredBookings = bookings.filter(booking => 
            booking.checkIn <= endDate && booking.checkOut >= startDate
        );
        
        const roomTypes = ['single', 'double', 'suite', 'deluxe'];
        const occupiedCounts = roomTypes.map(type => {
            return filteredBookings.filter(booking => {
                const room = rooms.find(r => r.id === booking.roomId);
                return room && room.type === type;
            }).length;
        });
        
        return {
            labels: roomTypes.map(type => capitalizeFirstLetter(type)),
            datasets: [{
                label: 'Occupied Rooms',
                data: occupiedCounts,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        };
    }

    function generateOccupancyReport(data) {
        const totalRooms = rooms.length;
        const totalOccupied = data.datasets[0].data.reduce((sum, count) => sum + count, 0);
        const occupancyRate = (totalOccupied / totalRooms * 100).toFixed(2);
        
        return `
            <h3>Occupancy Report Summary</h3>
            <p>Total Rooms: ${totalRooms}</p>
            <p>Occupied Rooms: ${totalOccupied}</p>
            <p>Occupancy Rate: ${occupancyRate}%</p>
            <h4>By Room Type:</h4>
            <ul>
                ${data.labels.map((label, index) => 
                    `<li>${label}: ${data.datasets[0].data[index]} occupied</li>`
                ).join('')}
            </ul>
        `;
    }

    function getRevenueData(startDate, endDate) {
        const filteredBookings = bookings.filter(booking => 
            booking.checkIn <= endDate && booking.checkOut >= startDate
        );
        
        const revenueByType = {};
        
        filteredBookings.forEach(booking => {
            const room = rooms.find(r => r.id === booking.roomId);
            if (room) {
                const nights = (new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24);
                const revenue = nights * room.price;
                
                if (!revenueByType[room.type]) {
                    revenueByType[room.type] = 0;
                }
                revenueByType[room.type] += revenue;
            }
        });
        
        const roomTypes = Object.keys(revenueByType);
        const revenues = roomTypes.map(type => revenueByType[type]);
        
        return {
            labels: roomTypes.map(type => capitalizeFirstLetter(type)),
            datasets: [{
                label: 'Revenue ($)',
                data: revenues,
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        };
    }

    function generateRevenueReport(data) {
        const totalRevenue = data.datasets[0].data.reduce((sum, revenue) => sum + revenue, 0);
        
        return `
            <h3>Revenue Report Summary</h3>
            <p>Total Revenue: $${totalRevenue.toFixed(2)}</p>
            <h4>By Room Type:</h4>
            <ul>
                ${data.labels.map((label, index) => 
                    `<li>${label}: $${data.datasets[0].data[index].toFixed(2)}</li>`
                ).join('')}
            </ul>
        `;
    }

    function getGuestData(startDate, endDate) {
        const filteredBookings = bookings.filter(booking => 
            booking.checkIn <= endDate && booking.checkOut >= startDate
        );
        
        const guestCountries = {};
        const guestVipStatus = {};
        
        filteredBookings.forEach(booking => {
            const guest = guests.find(g => g.id === booking.guestId);
            if (guest) {
                // Count by country
                if (!guestCountries[guest.country || 'Unknown']) {
                    guestCountries[guest.country || 'Unknown'] = 0;
                }
                guestCountries[guest.country || 'Unknown']++;
                
                // Count by VIP status
                if (!guestVipStatus[guest.vipStatus]) {
                    guestVipStatus[guest.vipStatus] = 0;
                }
                guestVipStatus[guest.vipStatus]++;
            }
        });
        
        return {
            labels: Object.keys(guestVipStatus).map(status => capitalizeFirstLetter(status)),
            datasets: [{
                label: 'Guests by VIP Status',
                data: Object.values(guestVipStatus),
                backgroundColor: 'rgba(153, 102, 255, 0.5)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }],
            countries: guestCountries
        };
    }

    function generateGuestReport(data) {
        const totalGuests = data.datasets[0].data.reduce((sum, count) => sum + count, 0);
        
        let countriesHTML = '';
        if (data.countries) {
            countriesHTML = `
                <h4>By Country:</h4>
                <ul>
                    ${Object.entries(data.countries).map(([country, count]) => 
                        `<li>${country}: ${count} guests</li>`
                    ).join('')}
                </ul>
            `;
        }
        
        return `
            <h3>Guest Demographics Report</h3>
            <p>Total Guests: ${totalGuests}</p>
            <h4>By VIP Status:</h4>
            <ul>
                ${data.labels.map((label, index) => 
                    `<li>${label}: ${data.datasets[0].data[index]} guests</li>`
                ).join('')}
            </ul>
            ${countriesHTML}
        `;
    }

    // Utility functions
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function formatDate(dateString) {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
});