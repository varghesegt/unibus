package com.unibus.backend.config;

import com.unibus.backend.entity.BoardingPoint;
import com.unibus.backend.entity.Bus;
import com.unibus.backend.entity.BusBoardingPoint;
import com.unibus.backend.entity.BusModel;
import com.unibus.backend.entity.User;
import com.unibus.backend.repository.BoardingPointRepository;
import com.unibus.backend.repository.BusBoardingPointRepository;
import com.unibus.backend.repository.BusModelRepository;
import com.unibus.backend.repository.BusRepository;
import com.unibus.backend.repository.SeatRepository;
import com.unibus.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;
import java.util.LinkedList;
import java.util.Queue;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BoardingPointRepository boardingPointRepository;

    @Autowired
    private BusModelRepository busModelRepository;

    @Autowired
    private BusRepository busRepository;

    @Autowired
    private BusBoardingPointRepository busBoardingPointRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public void run(String... args) throws Exception {
        // Do nothing. Users will create models and buses manually.
    }

    private void seedDatabase() throws Exception {
        // 1. Boarding Points
        String[] points = {"Palakarai", "Marakadai", "Star Theatre", "Bheemanagar", "Chathram"};
        double[][] coords = {
                {10.8050, 78.6856},
                {10.8105, 78.6922},
                {10.8143, 78.6874},
                {10.8180, 78.6940},
                {10.8256, 78.6912}
        };
        
        BoardingPoint[] bps = new BoardingPoint[points.length];
        for (int i = 0; i < points.length; i++) {
            bps[i] = BoardingPoint.builder().name(points[i]).latitude(coords[i][0]).longitude(coords[i][1]).build();
            boardingPointRepository.save(bps[i]);
        }

        // 2. Bus Models (53+2, 55+2, 57+2)
        BusModel model53 = createBusModel("53+2 Seater", 11, 10);
        BusModel model55 = createBusModel("55+2 Seater", 11, 11);
        BusModel model57 = createBusModel("57+2 Seater", 12, 11);
        
        busModelRepository.save(model53);
        busModelRepository.save(model55);
        busModelRepository.save(model57);

        // 3. Add Buses
        Bus bus1 = createBus("TN-45-AB-1234", "Route A - Chathram", "Raja", "9876543210", model55);
        Bus bus2 = createBus("TN-45-BC-5678", "Route B - Palakarai", "Kumar", "9876543211", model53);
        Bus bus3 = createBus("TN-45-CD-9012", "Route C - Bheemanagar", "Mani", "9876543212", model57);

        // 4. Bus Boarding Points mapping
        assignBoardingPoints(bus1, bps, new int[]{4, 1, 0}, new String[]{"07:30", "07:45", "08:00"});
        assignBoardingPoints(bus2, bps, new int[]{0, 2, 3}, new String[]{"07:40", "07:50", "08:10"});
        assignBoardingPoints(bus3, bps, new int[]{3, 1, 4}, new String[]{"07:35", "07:55", "08:15"});

        // 5. Seed Users
        seedUsers(bus1);
    }

    private BusModel createBusModel(String name, int leftRows, int rightRows) {
        ObjectNode root = objectMapper.createObjectNode();
        
        // Left zone (3 seats per row)
        ObjectNode leftZone = objectMapper.createObjectNode();
        leftZone.put("height", 100);
        leftZone.put("seatsPerRow", 3);
        ArrayNode leftRowsNode = leftZone.putArray("seatsRows");
        for (int i = 0; i < leftRows; i++) {
            ArrayNode row = leftRowsNode.addArray();
            row.add(createSeat("-L" + (i+1) + "A"));
            row.add(createSeat("-L" + (i+1) + "B"));
            row.add(createSeat("-L" + (i+1) + "C"));
        }
        root.set("leftSeatColumns", leftZone);

        // Right zone (2 seats per row)
        ObjectNode rightZone = objectMapper.createObjectNode();
        rightZone.put("height", 100);
        rightZone.put("seatsPerRow", 2);
        ArrayNode rightRowsNode = rightZone.putArray("seatsRows");
        for (int i = 0; i < rightRows; i++) {
            ArrayNode row = rightRowsNode.addArray();
            row.add(createSeat("-R" + (i+1) + "A"));
            row.add(createSeat("-R" + (i+1) + "B"));
        }
        root.set("rightSeatColumns", rightZone);

        return BusModel.builder().modelName(name).data(root.toString()).build();
    }

    private ObjectNode createSeat(String id) {
        ObjectNode seat = objectMapper.createObjectNode();
        seat.put("id", id);
        seat.put("seatStatus", "available");
        return seat;
    }

    private Bus createBus(String busNumber, String routeName, String driverName, String driverPhone, BusModel model) throws Exception {
        Map<String, String> seatsMap = new HashMap<>();
        Queue<com.fasterxml.jackson.databind.JsonNode> queue = new LinkedList<>();
        queue.add(objectMapper.readTree(model.getData()));
        while (!queue.isEmpty()) {
            com.fasterxml.jackson.databind.JsonNode node = queue.poll();
            if (node.isObject()) {
                if (node.has("id") && node.get("id").isTextual()) {
                    String status = "available";
                    if (node.has("seatStatus") && node.get("seatStatus").isTextual()) {
                        String sStatus = node.get("seatStatus").asText();
                        if ("unavailable".equals(sStatus) || "deleted".equals(sStatus)) {
                            status = "unavailable";
                        }
                    }
                    seatsMap.put(node.get("id").asText(), status);
                }
                node.fields().forEachRemaining(entry -> queue.add(entry.getValue()));
            } else if (node.isArray()) {
                node.forEach(queue::add);
            }
        }
        
        Bus bus = Bus.builder()
                .modelId(model.getId())
                .busNumber(busNumber)
                .routeName(routeName)
                .driverName(driverName)
                .driverPhone(driverPhone)
                .seats(objectMapper.writeValueAsString(seatsMap))
                .build();
        return busRepository.save(bus);
    }

    private void assignBoardingPoints(Bus bus, BoardingPoint[] allBps, int[] indices, String[] times) {
        for (int i = 0; i < indices.length; i++) {
            BusBoardingPoint bbp = BusBoardingPoint.builder()
                    .busId(bus.getId())
                    .boardingPointId(allBps[indices[i]].getId())
                    .arrivalTime(LocalTime.parse(times[i]))
                    .build();
            busBoardingPointRepository.save(bbp);
        }
    }

    private void seedUsers(Bus defaultBus) throws Exception {
        // Admin
        User admin = User.builder()
                .rollNo("ADMIN01")
                .name("System Admin")
                .email("admin@university.edu")
                .password(passwordEncoder.encode("AdminPassword123!"))
                .gender("Male")
                .phone("9876543211")
                .address("Admin Block")
                .dateOfBirth(LocalDate.parse("1980-01-01"))
                .college("Administration")
                .degree("N/A")
                .department("Admin")
                .year("N/A")
                .semester("N/A")
                .isAdmin(true)
                .isVerified(true)
                .build();
        userRepository.save(admin);

        // 10 sample students
        String[] genders = {"Female", "Female", "Female", "Female", "Female", "Male", "Male", "Male", "Male", "Male"};
        String[] names = {"Priya", "Anitha", "Kavya", "Deepa", "Sneha", "Rahul", "Karthik", "Vijay", "Arjun", "Sanjay"};
        
        // Let's manually book seats for a few to show distribution
        // Females in front rows: L1A, L1B, L2A
        // Males in back rows: R10A, R10B, L10A
        String[] preBookedSeats = {"-L1A", "-L1B", "-L2A", null, null, "-R10A", "-R10B", "-L10A", null, null};

        Map<String, String> busSeats = objectMapper.readValue(defaultBus.getSeats(), new com.fasterxml.jackson.core.type.TypeReference<Map<String, String>>() {});

        for (int i = 0; i < 10; i++) {
            User user = User.builder()
                    .rollNo("20CS1" + String.format("%02d", i))
                    .name(names[i])
                    .email(names[i].toLowerCase() + "@university.edu")
                    .password(passwordEncoder.encode("Password123!"))
                    .gender(genders[i])
                    .phone("98765432" + String.format("%02d", i))
                    .address("Address " + i)
                    .dateOfBirth(LocalDate.parse("2002-05-15"))
                    .college("K. RAMAKRISHNAN COLLEGE OF ENGINEERING")
                    .degree("B.E.")
                    .department("CSE")
                    .year("III")
                    .semester("5")
                    .isAdmin(false)
                    .isVerified(true)
                    .build();
            userRepository.save(user);

            if (preBookedSeats[i] != null) {
                String seatId = preBookedSeats[i];
                String status = genders[i].equals("Male") ? "bookedMale" : "bookedFemale";
                busSeats.put(seatId, status);
                
                com.unibus.backend.entity.Seat seatRecord = com.unibus.backend.entity.Seat.builder()
                        .userId(user.getId())
                        .busId(defaultBus.getId())
                        .seatId(seatId)
                        .status(status)
                        .build();
                seatRepository.save(seatRecord);
            }
        }
        
        // Seed the requested user account parsed from the receipt image
        User varghese = User.builder()
                .rollNo("ME23021")
                .name("VARGHESE G T")
                .email("me2355@krce.ac.in")
                .password(passwordEncoder.encode("Password123!"))
                .gender("Male")
                .phone("9876543220")
                .address("Trichy")
                .dateOfBirth(LocalDate.parse("2005-06-15"))
                .college("K. RAMAKRISHNAN COLLEGE OF ENGINEERING")
                .degree("B.E.")
                .department("MECH")
                .year("IV")
                .semester("8")
                .isAdmin(false)
                .isVerified(true)
                .build();
        userRepository.save(varghese);

        defaultBus.setSeats(objectMapper.writeValueAsString(busSeats));
        busRepository.save(defaultBus);
    }
}
