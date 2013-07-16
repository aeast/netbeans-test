/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gannett.janrain;

import com.google.gson.Gson;
import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.w3c.dom.Element;

// part 2
import org.apache.commons.io.IOUtils;
import java.net.URL;
import java.net.URLEncoder;
import java.net.HttpURLConnection;
import java.io.OutputStreamWriter;
import java.io.IOException;
/**
 *
 * @author aeast
 */
@WebServlet(name = "JanrainTokenServlet", urlPatterns = {"/AuthTokenServlet"})
public class JanrainTokenServlet extends HttpServlet {

    /**
     * Processes requests for both HTTP
     * <code>GET</code> and
     * <code>POST</code> methods.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            String token = request.getParameter("token");

     /*       URL url = new URL("https://rpxnow.com/api/v2/auth_info");
            String params = String.format("apiKey=%s&token=%s", URLEncoder.encode("a8a6e718275902c6cbe7da5e6e314a132e15129a", "UTF-8"), URLEncoder.encode(token, "UTF-8"));
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("POST");
            connection.setDoOutput(true);
            connection.connect();
            OutputStreamWriter writer = new OutputStreamWriter(connection.getOutputStream(), "UTF-8");
            writer.write(params);
            writer.close(); 
            // Here, we're just copying the rsponse returned by the API to the page served to the browser.
            response.setCharacterEncoding("UTF-8");
            response.setContentType("text/javascript");
            IOUtils.copy(connection.getInputStream(), response.getOutputStream());
      */      
            Rpx rpx = new Rpx("a8a6e718275902c6cbe7da5e6e314a132e15129a", "https://rpxnow.com/");
            
            //Element apiResponse = rpx.authInfo(token);
            String apiResponse = rpx.authInfo(token);
            
            Gson gson = new Gson();
            
            JanrainUser user = gson.fromJson(apiResponse, JanrainUser.class);
            
            System.out.println(apiResponse.toString());
            
            request.getSession().setAttribute("authInfo", user);
            
            String forwardURL = "/AndyTest/janrainLoggedIn.jsp";
            response.sendRedirect(forwardURL);
            //String forwardURL = "/janrainLoggedIn.jsp";
            //RequestDispatcher dispatcher = getServletContext().getRequestDispatcher(forwardURL);
            //dispatcher.forward(request, response);
            
            
        }
        catch (Exception e) {
            System.out.println(e.getMessage());
        }
        finally {            
        }
    }

    // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /**
     * Handles the HTTP
     * <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Handles the HTTP
     * <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>
}
