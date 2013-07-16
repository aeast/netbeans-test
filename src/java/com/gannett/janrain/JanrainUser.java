/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gannett.janrain;


/**
 *
 * @author aeast
 */
public class JanrainUser {
    
    private String stat = null;

    public String getStat() {
        return stat;
    }

    public void setStat(String stat) {
        this.stat = stat;
    }

    public JanrainProfile getProfile() {
        return profile;
    }

    public void setProfile(JanrainProfile profile) {
        this.profile = profile;
    }

    public String getLimited_data() {
        return limited_data;
    }

    public void setLimited_data(String limited_data) {
        this.limited_data = limited_data;
    }
    private JanrainProfile profile = null;
    private String limited_data = null;
    
    public JanrainUser() {
        
    }

    
    
    
    
}
