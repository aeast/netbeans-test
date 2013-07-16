/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gannett.backplane;

/**
 *
 * @author aeast
 */
public class Backplane {

    private String userID = null;
    private String password = null;

    public Backplane() {
    }

    public Backplane(String uid, String pwd) {
        this.userID = uid;
        this.password = pwd;
    }

    public String getUserID() {
        return userID;
    }

    public void setUserID(String userID) {
        this.userID = userID;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
    
    
}
