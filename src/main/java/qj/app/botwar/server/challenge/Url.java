package qj.app.botwar.server.challenge;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

/**
 * Created by quan on 6/7/2015.
 */
@Retention(RetentionPolicy.RUNTIME)
public @interface Url {
    String value();
}