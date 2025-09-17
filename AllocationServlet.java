import javax.servlet.*;
import javax.servlet.http.*;
import java.io.*;
import java.sql.*;
import org.json.*;

public class AllocationServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json; charset=UTF-8");
        PrintWriter out = res.getWriter();
        JSONArray result = new JSONArray();
        try (Connection conn = DBUtil.getConnection();
             Statement st = conn.createStatement();
             ResultSet rs = st.executeQuery("SELECT * FROM allocations")) {
            while (rs.next()) {
                JSONObject obj = new JSONObject();
                obj.put("id", rs.getInt("id"));
                obj.put("device_id", rs.getInt("device_id"));
                obj.put("date", rs.getString("date"));
                obj.put("timeslot", rs.getString("timeslot"));
                obj.put("comment", rs.getString("comment"));
                obj.put("bgcolor", rs.getString("bgcolor"));
                obj.put("fontcolor", rs.getString("fontcolor"));
                obj.put("borderstyle", rs.getString("borderstyle"));
                obj.put("pos_x", rs.getInt("pos_x"));
                obj.put("pos_y", rs.getInt("pos_y"));
                obj.put("width", rs.getInt("width"));
                obj.put("height", rs.getInt("height"));
                result.put(obj);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        out.print(result.toString());
    }

    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {
        BufferedReader reader = req.getReader();
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) sb.append(line);
        JSONArray arr = new JSONArray(sb.toString());

        try (Connection conn = DBUtil.getConnection()) {
            PreparedStatement ps = conn.prepareStatement(
                "MERGE INTO allocations a USING (SELECT ? id FROM dual) b ON (a.id = b.id) " +
                "WHEN MATCHED THEN UPDATE SET device_id=?, date=TO_DATE(?, 'YYYY-MM-DD'), timeslot=?, comment=?, bgcolor=?, fontcolor=?, borderstyle=?, pos_x=?, pos_y=?, width=?, height=? " +
                "WHEN NOT MATCHED THEN INSERT (id, device_id, date, timeslot, comment, bgcolor, fontcolor, borderstyle, pos_x, pos_y, width, height) VALUES (?, ?, TO_DATE(?, 'YYYY-MM-DD'), ?, ?, ?, ?, ?, ?, ?, ?, ?)"
            );
            for (int i = 0; i < arr.length(); i++) {
                JSONObject o = arr.getJSONObject(i);
                int idx = 1;
                // for update
                ps.setInt(idx++, o.getInt("id"));
                ps.setInt(idx++, o.getInt("device_id"));
                ps.setString(idx++, o.getString("date"));
                ps.setString(idx++, o.getString("timeslot"));
                ps.setString(idx++, o.getString("comment"));
                ps.setString(idx++, o.getString("bgcolor"));
                ps.setString(idx++, o.getString("fontcolor"));
                ps.setString(idx++, o.getString("borderstyle"));
                ps.setInt(idx++, o.getInt("pos_x"));
                ps.setInt(idx++, o.getInt("pos_y"));
                ps.setInt(idx++, o.getInt("width"));
                ps.setInt(idx++, o.getInt("height"));
                // for insert
                ps.setInt(idx++, o.getInt("id"));
                ps.setInt(idx++, o.getInt("device_id"));
                ps.setString(idx++, o.getString("date"));
                ps.setString(idx++, o.getString("timeslot"));
                ps.setString(idx++, o.getString("comment"));
                ps.setString(idx++, o.getString("bgcolor"));
                ps.setString(idx++, o.getString("fontcolor"));
                ps.setString(idx++, o.getString("borderstyle"));
                ps.setInt(idx++, o.getInt("pos_x"));
                ps.setInt(idx++, o.getInt("pos_y"));
                ps.setInt(idx++, o.getInt("width"));
                ps.setInt(idx++, o.getInt("height"));
                ps.addBatch();
            }
            ps.executeBatch();
        } catch (Exception e) {
            e.printStackTrace();
        }
        res.setStatus(200);
    }
}
