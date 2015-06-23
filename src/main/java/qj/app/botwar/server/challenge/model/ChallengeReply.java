package qj.app.botwar.server.challenge.model;

import java.util.Date;

/**
 * Created by quan on 6/7/2015.
 */
public class ChallengeReply {
    public Long id;
    public Long toChallenge;
    public String message;

    public String fromName;
    public String fromId;
    public String fromAuthenType;
    public String fromEmail;

    public Date createTime;
    public Object bot;
}
