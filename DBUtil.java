import java.sql.*;

public class DBUtil {
    private static final String URL = "jdbc:oracle:thin:@localhost:1521:XE";
    private static final String USER = "your_user";
    private static final String PASS = "your_pass";

    static {
        try {
            Class.forName("oracle.jdbc.driver.OracleDriver");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASS);
    }
}
