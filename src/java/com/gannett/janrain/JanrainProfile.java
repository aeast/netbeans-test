/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gannett.janrain;

/**
 *
 * @author aeast
 */
public class JanrainProfile {

    public JanrainProfile() {
    }
    
    
    private String providerName = null;

    public String getProviderName() {
        return providerName;
    }

    public void setProviderName(String providerName) {
        this.providerName = providerName;
    }

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public String getVerifiedEmail() {
        return verifiedEmail;
    }

    public void setVerifiedEmail(String verifiedEmail) {
        this.verifiedEmail = verifiedEmail;
    }

    public String getPreferredUsername() {
        return preferredUsername;
    }

    public void setPreferredUsername(String preferredUsername) {
        this.preferredUsername = preferredUsername;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getPhoto() {
        return photo;
    }

    public void setPhoto(String photo) {
        this.photo = photo;
    }

    public String getUtcOffset() {
        return utcOffset;
    }

    public void setUtcOffset(String utcOffset) {
        this.utcOffset = utcOffset;
    }

    public String getBirthday() {
        return birthday;
    }

    public void setBirthday(String birthday) {
        this.birthday = birthday;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getProviderSpecific() {
        return providerSpecific;
    }

    public void setProviderSpecific(String providerSpecific) {
        this.providerSpecific = providerSpecific;
    }
    private String identifier = null;
    private String  verifiedEmail = null;
    private String preferredUsername = null;
    private String displayName = null;
    private String email = null;
    private String url = null;
    private String photo = null;
    private String utcOffset = null;
    private String birthday = null;
    private String gender = null;
    private String providerSpecific = null;
    
}
