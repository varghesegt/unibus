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
        if (userRepository.count() == 0) {
            System.out.println("Seeding database with default data...");
            seedDatabase();
            System.out.println("Database seeding complete!");
        }
    }

    private void seedDatabase() throws Exception {
        // =============================================
        // 1. Create Boarding Points (5 total)
        // =============================================
        BoardingPoint bp1 = boardingPointRepository.save(
                BoardingPoint.builder().name("Palakarai").latitude(10.8050).longitude(78.6856).build());
        BoardingPoint bp2 = boardingPointRepository.save(
                BoardingPoint.builder().name("Marakadai").latitude(10.8105).longitude(78.6922).build());
        BoardingPoint bp3 = boardingPointRepository.save(
                BoardingPoint.builder().name("Star Theatre").latitude(10.8143).longitude(78.6874).build());
        BoardingPoint bp4 = boardingPointRepository.save(
                BoardingPoint.builder().name("Bheemanagar").latitude(10.8180).longitude(78.6940).build());
        BoardingPoint bp5 = boardingPointRepository.save(
                BoardingPoint.builder().name("Chathram").latitude(10.8256).longitude(78.6912).build());

        BoardingPoint[] allBps = {bp1, bp2, bp3, bp4, bp5};

        // =============================================
        // 2. Create the 55+2 Seater Bus Model
        //    Layout: Front Left 3 rows (1+2+2=5 seats)
        //            Left 8 rows x 2 seats = 16 seats
        //            Right 10 rows x 3 seats = 30 seats
        //            Back 1 row x 6 seats = 6 seats
        //    Total: 57 Active Seats
        // =============================================
        BusModel model = createDefaultModel();
        busModelRepository.save(model);

        // =============================================
        // 3. Create 5 Buses (each using the 55+2 model)
        // =============================================
        Bus bus1 = createBus("TN-45-AB-1234", "Route A - Chathram", "Raja", "9876543210", model);
        Bus bus2 = createBus("TN-45-BC-5678", "Route B - Palakarai", "Kumar", "9876543211", model);
        Bus bus3 = createBus("TN-45-CD-9012", "Route C - Bheemanagar", "Mani", "9876543212", model);
        Bus bus4 = createBus("TN-45-DE-3456", "Route D - Star Theatre", "Senthil", "9876543213", model);
        Bus bus5 = createBus("TN-45-EF-7890", "Route E - Marakadai", "Velu", "9876543214", model);

        // =============================================
        // 4. Assign 3 Boarding Points to each Bus
        // =============================================
        // Bus 1: Chathram -> Marakadai -> Palakarai
        assignBoardingPoints(bus1, allBps, new int[]{4, 1, 0}, new String[]{"07:30", "07:45", "08:00"});
        // Bus 2: Palakarai -> Star Theatre -> Bheemanagar
        assignBoardingPoints(bus2, allBps, new int[]{0, 2, 3}, new String[]{"07:40", "07:50", "08:10"});
        // Bus 3: Bheemanagar -> Chathram -> Star Theatre
        assignBoardingPoints(bus3, allBps, new int[]{3, 4, 2}, new String[]{"07:35", "07:55", "08:15"});
        // Bus 4: Star Theatre -> Palakarai -> Marakadai
        assignBoardingPoints(bus4, allBps, new int[]{2, 0, 1}, new String[]{"07:25", "07:40", "08:00"});
        // Bus 5: Marakadai -> Bheemanagar -> Chathram
        assignBoardingPoints(bus5, allBps, new int[]{1, 3, 4}, new String[]{"07:30", "07:50", "08:05"});

        // =============================================
        // 5. Create Default Users
        // =============================================
        seedUsers();
    }

    /**
     * Creates the 55+2 Seater bus model with the exact layout:
     *
     * DRIVER SECTION
     * ─────────────────────────────
     * [LA1]          [RA3][RA2][RA1]
     * [LB1][LB2]     [RB3][RB2][RB1]
     * [LC1][LC2]     [RC3][RC2][RC1]
     *   (gap)        [RD3][RD2][RD1]
     * [LD1][LD2]     [RE3][RE2][RE1]
     * [LE1][LE2]     [RF3][RF2][RF1]
     * [LF1][LF2]     [RG3][RG2][RG1]
     * [LG1][LG2]     [RH3][RH2][RH1]
     * [LH1][LH2]     [RI3][RI2][RI1]
     * [LI1][LI2]     [RJ3][RJ2][RJ1]
     * [LJ1][LJ2]
     * [LK1][LK2]
     * [BA1][BA2][BA3][BA4][BA5][BA6]
     */
    private BusModel createDefaultModel() {
        ObjectNode root = objectMapper.createObjectNode();

        // --- Front Left (leftTopSeatColumns): 3 rows ---
        // Row A: 1 seat (LA1), Row B: 2 seats, Row C: 2 seats
        ObjectNode leftTopZone = objectMapper.createObjectNode();
        leftTopZone.put("height", 100);
        leftTopZone.put("seatsPerRow", 2);
        ArrayNode leftTopRows = leftTopZone.putArray("seatsRows");

        // Row A: only 1 seat (LA1), second position is null (invisible spacer)
        ArrayNode rowA = leftTopRows.addArray();
        rowA.add(createSeat("LA1"));
        rowA.addNull();

        // Row B: 2 seats
        ArrayNode rowB = leftTopRows.addArray();
        rowB.add(createSeat("LB1"));
        rowB.add(createSeat("LB2"));

        // Row C: 2 seats
        ArrayNode rowC = leftTopRows.addArray();
        rowC.add(createSeat("LC1"));
        rowC.add(createSeat("LC2"));

        root.set("leftTopSeatColumns", leftTopZone);

        // --- Left (leftSeatColumns): 8 rows x 2 seats ---
        String[] leftLetters = {"D", "E", "F", "G", "H", "I", "J", "K"};
        ObjectNode leftZone = objectMapper.createObjectNode();
        leftZone.put("height", 100);
        leftZone.put("seatsPerRow", 2);
        ArrayNode leftRows = leftZone.putArray("seatsRows");
        for (String letter : leftLetters) {
            ArrayNode row = leftRows.addArray();
            row.add(createSeat("L" + letter + "1"));
            row.add(createSeat("L" + letter + "2"));
        }
        root.set("leftSeatColumns", leftZone);

        // --- Right (rightSeatColumns): 10 rows x 3 seats ---
        String[] rightLetters = {"A", "B", "C", "D", "E", "F", "G", "H", "I", "J"};
        ObjectNode rightZone = objectMapper.createObjectNode();
        rightZone.put("height", 100);
        rightZone.put("seatsPerRow", 3);
        ArrayNode rightRows = rightZone.putArray("seatsRows");
        for (String letter : rightLetters) {
            ArrayNode row = rightRows.addArray();
            row.add(createSeat("R" + letter + "1"));
            row.add(createSeat("R" + letter + "2"));
            row.add(createSeat("R" + letter + "3"));
        }
        root.set("rightSeatColumns", rightZone);

        // --- Back (backSeats): 1 row x 6 seats ---
        ObjectNode backZone = objectMapper.createObjectNode();
        backZone.put("height", 100);
        backZone.put("seatsPerRow", 6);
        ArrayNode backRows = backZone.putArray("seatsRows");
        ArrayNode backRow = backRows.addArray();
        for (int i = 1; i <= 6; i++) {
            backRow.add(createSeat("BA" + i));
        }
        root.set("backSeats", backZone);

        return BusModel.builder().modelName("55+2 Seater").data(root.toString()).build();
    }

    private ObjectNode createSeat(String id) {
        ObjectNode seat = objectMapper.createObjectNode();
        seat.put("id", id);
        seat.put("seatStatus", "available");
        return seat;
    }

    private Bus createBus(String busNumber, String routeName, String driverName, String driverPhone, BusModel model) throws Exception {
        // Parse model JSON to build seats map (all seats start as "available")
        Map<String, String> seatsMap = new HashMap<>();
        Queue<com.fasterxml.jackson.databind.JsonNode> queue = new LinkedList<>();
        queue.add(objectMapper.readTree(model.getData()));
        while (!queue.isEmpty()) {
            com.fasterxml.jackson.databind.JsonNode node = queue.poll();
            if (node == null || node.isNull()) continue;
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

    private void seedUsers() {
        // Admin Account
        User admin = User.builder()
                .rollNo("ADMIN01")
                .name("System Admin")
                .email("admin@university.edu")
                .password(passwordEncoder.encode("AdminPassword123!"))
                .gender("Male")
                .phone("9876543211")
                .address("Admin Block")
                .dateOfBirth(LocalDate.parse("1980-01-01"))
                .college("K. RAMAKRISHNAN COLLEGE OF ENGINEERING")
                .degree("N/A")
                .department("Admin")
                .year("N/A")
                .semester("N/A")
                .isAdmin(true)
                .isVerified(true)
                .build();
        userRepository.save(admin);

        // Student Account (from receipt)
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

        // 10 Sample Students (5 Female + 5 Male)
        String[] genders = {"Female", "Female", "Female", "Female", "Female", "Male", "Male", "Male", "Male", "Male"};
        String[] names = {"Priya", "Anitha", "Kavya", "Deepa", "Sneha", "Rahul", "Karthik", "Vijay", "Arjun", "Sanjay"};

        for (int i = 0; i < 10; i++) {
            User user = User.builder()
                    .rollNo("20CS1" + String.format("%02d", i))
                    .name(names[i])
                    .email(names[i].toLowerCase() + "@university.edu")
                    .password(passwordEncoder.encode("Password123!"))
                    .gender(genders[i])
                    .phone("98765432" + String.format("%02d", i))
                    .address("Address " + (i + 1))
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
        }
    }
}
