package qj.app.botwar.server.challenge.model;

/**
 * Created by quan on 6/8/2015.
 */
public class Authen {
    public String type;
    public String id;
    public String username;
    public String email;

    public Authen(String type, String id, String username, String email) {
        this.type = type;
        this.id = id;
        this.username = username;
        this.email = email;
    }
}
