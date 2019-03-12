<?php

class Email extends CI_Controller {

    function __construct() {
        parent::__construct();
        $this->load->library('session');
    }

    public function send_mail() {
        $from_email = $this->input->post('email');
        $name = $this->input->post('name');
        $message = $this->input->post('message');
        
        $emailText = '<tr>
                      <td style="padding:20px 30px 20px 30px;background:#fff;font-size:0.13in;font-weight:600;color:#484848;font-family:helvetica,arial,sans-serif">
                        <table style="width:100%" cellspacing="10" cellpadding="0">
                           <tbody>
                           <tr>
                               <td>Dear Foodiiz team,</td>
                           </tr>
                           <tr>
                               <td>
                                   <p>You have received an email from one of your customers.</p>
                                   <p>Message:</p>
                                   <p>' . $message . '</p>
                               </td>
                           </tr>
                           </tbody>
                       </table>
                     </td>
                   </tr>';
        $to = "info@foodiiz.com";
        $bodyText = $this->getMailBody($emailText);
        $subject = 'You have received an email from ' . $name;
        $headers = 'From: ' . $from_email . "\r\n";
        $headers .= 'Bcc: ' . 'info@foodiiz.com' . "\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=ISO-8859-1\r\n";
        mail($to, $subject, $bodyText, $headers);
        echo json_encode(array(
            "response" => "success"
        ));
    }

    /**
     * @name getMailBody
     * @param $emailText
     * @return string
     */
    function getMailBody($emailText) {
        $imageFolder = base_url() . '/assets/images/email/';
        $year = date("Y");
        $text = '<!DOCTYPE HTML>
                 <html>
                 <head>
                     <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                     <title>Your Website</title>
                 </head>
                 <body>
                 <div id=":1am" class="ii gt adP adO"><div id=":1an" class="a3s aXjCH m15c27dbb91b220be"><div class="adM">
                 </div><div><div class="adM">
                 </div><table border="0" width="100%" height="100%" cellpadding="0" cellspacing="0" bgcolor="#F0F0F0">
                     <tbody><tr>
                         <td align="center" class="m_-1338626320459824369main_cnt" valign="top" bgcolor="#f4f4f4" style="border-radius:6px;background-color:#e2e1e1">
                             <table border="0" cellpadding="0" cellspacing="0" style="width:100%;max-width:800px;margin-top:54px;padding:10px 20px">
                                 <tbody><tr>
                                     <td>
                                         <table height="80" style="width:100%" cellspacing="0" cellpadding="0">
                                             <tbody>
                                             <tr>
                                                 <td align="center" style="background-color:#e24e42">
                                                     <a href="http://www.foodiiz.com/" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=es&amp;q=http://www.foodiiz.com/&amp;source=gmail&amp;ust=1495403986306000&amp;usg=AFQjCNHITL-qaYY5qrBwsTIWg6aMuTJi5Q">
                                                         <img width="200px" src="' . $imageFolder . 'foodiiz.png" alt="" class="CToWUd">
                                                     </a>
                                                 </td>
                                             </tr>
                                             </tbody>
                                         </table>
                                     </td>
                                 </tr>
                                 ' . $emailText . '
                                 <tr>
                                     <td>
                                         <table cellpadding="0" cellspacing="0" style="width:100%;text-align:center;background:#e24e42;height:auto;padding-top:15px;padding-bottom:15px">
                                             <tbody><tr>
                                                 <td align="center" style="padding-top:2px">
                                                     <a href="https://www.facebook.com/foodiizofficial/" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=es&amp;q=https://www.facebook.com/foodiizofficial&amp;source=gmail&amp;ust=1495403986306000&amp;usg=AFQjCNGUKtzRHsDcsWvR6VW8tXEo1Fehcw"><img src="' . $imageFolder . 'facebook-logo.png" title="Facebook" style="border-radius:50%;margin-right:5px" width="35" height="35" class="CToWUd"></a>
                                                     <a href="https://www.instagram.com/foodiizofficiall/" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=es&amp;q=https://www.instagram.com/foodiizofficiall/&amp;source=gmail&amp;ust=1495403986306000&amp;usg=AFQjCNH89ZdZnYW597DZ4FhHEvbWhxyjEA"><img src="' . $imageFolder . 'instagram-logo.png" title="Instagram" style="border-radius:50%;margin-right:5px" width="35" height="35" class="CToWUd"></a>
                                                     <a href="https://twitter.com/foodiizofficial" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=es&amp;q=http://twitter.com/foodiizofficial&amp;source=gmail&amp;ust=1495403986306000&amp;usg=AFQjCNEBsoJfxQo6dodQI4H9eo6-oYVMFw"><img src="' . $imageFolder . 'twitter-logo.png" title="Twitter" style="border-radius:50%;margin-right:5px" width="35" class="CToWUd"></a>
                                                 </td>
                                             </tr>
                                             <tr>
                                                 <td style="font-size:13px;color:white!important"></td>
                                             </tr>
                                             </tbody></table>
                                     </td>
                                 </tr>
                                 <tr><td style="font-size:12px;padding-top:10px;padding-bottom:3px" align="center"></td></tr>
                                 <tr> <td style="font-size:12px;padding-bottom:10px" align="center">Copyright <a href="tel:2016%202017" value="+50620162017" target="_blank">' . $year . '</a> <a style="color:#227dbf!important;text-decoration:none" href="https://www.foodiiz.com/" target="_blank" data-saferedirecturl="https://www.google.com/url?hl=es&amp;q=https://www.foodiiz.com/&amp;source=gmail&amp;ust=1495403986306000&amp;usg=AFQjCNFXnsWwW34tOY-WscUi2oNwu-9HjQ"></a> All Rights Reserved.</td></tr>
                                 </tbody></table>

                         </td></tr></tbody></table><div class="yj6qo"></div><div class="adL"> </div></div><div class="adL">
                 </div></div></div>
                 </body>
                 </html>';
        return $text;
    }

}
