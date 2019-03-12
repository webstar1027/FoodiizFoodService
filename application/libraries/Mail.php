<?php

defined('BASEPATH') OR exit('No direct script access allowed');

class Mail {

    private $CI;

    public function __construct() {
        $this->CI = & get_instance();
        $this->CI->load->library('email');
    }

    public function create($data, $to, $subject) {
        $body = $this->getBodyMail($data);
        $this->sendEmail($to, $body, $subject);
    }

    public function sendEmail($to, $body, $subject) {

        $config = array(
            'protocol' => 'smtp',
            'smtp_crypto' => 'ssl',
            'smtp_host' => 'mail.foodiiz.com',
            'smtp_port' => 465,
            'smtp_user' => 'info@foodiiz.com',
            'smtp_pass' => 'foodie2018$$',
            'mailtype' => 'html',
            'charset' => 'utf-8',
            'crlf' => '\r\n',
            'mailtype' => 'html'
        );

        $this->CI->email->initialize($config);
        $this->CI->email->set_newline('\r\n');
        $this->CI->email->from('info@foodiiz.com', 'Foodiiz');
        $this->CI->email->to($to);
        $this->CI->email->subject($subject);
        $this->CI->email->message($body);
        $this->CI->email->send();
    }

    public function button($link, $text) {
        return '<a href="' . $link . '" class="button-link" target="_blank" alt="' . $text . '">' . $text . '</a>';
    }

    function getBodyMail($lines) {
        $bodyText = "";
        $imageFolder = base_url() . '/assets/images/email/';
        $year = date("Y");
        foreach ($lines as $line) {
            $bodyText .= '<tr><th>' . $line . '</tr></th>';
        }
        $text = '<!DOCTYPE html>
                <html xmlns="http://www.w3.org/1999/xhtml">
                    <head>
                        <title>Foodiiz</title>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                        <link href="http://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet" type="text/css">
                            <style type="text/css">
                                @media screen {
                                    @font-face{
                                        font-family:"Open Sans";
                                        font-style:normal;
                                        font-weight:normal;
                                        src:local("Open Sans"), local("OpenSans"), url("http://fonts.gstatic.com/s/opensans/v10/cJZKeOuBrn4kERxqtaUH3bO3LdcAZYWl9Si6vvxL-qU.woff") format("woff");
                                    }
                                    body {
                                        font-family: Arial, sans-serif;
                                        font-size: 0.14in;
                                    }
                                    table {
                                        width: 100%;
                                        display: flex;
                                        margin: 0;
                                    }
                                    tbody {
                                        width: 100%;
                                    }
                                    tr {
                                        width: 100%;
                                        display: block;
                                    }
                                    th {
                                        width: 100%;
                                        color: #484848;
                                        display: block;
                                        text-align: justify;
                                        padding: 5px 10px;
                                        font-size: 0.16in;
                                    }
                                    a {
                                        text-decoration: none;
                                        margin: 0 auto;
                                    }
                                    .button-link {
                                        display: table;
                                        border-radius: 5px;
                                        color: #fff !important;
                                        background-color: #e24e42 !important;
                                        border: 1px solid #e24e42 !important;
                                        background-image: linear-gradient(to bottom, #e24e42 0%, #e24e42 100%);
                                        text-shadow: none !important;
                                        text-transform: uppercase;
                                        text-decoration: none;
                                        padding: 10px 15px;
                                        line-height: 30px;
                                        font-weight: bold;
                                    }
                                    .button-link:hover {
                                        border: 1px solid #de5a4f !important;
                                        background: -moz-linear-gradient(top, #de5a4f 0%, #de5a4f 100%);
                                        background: -webkit-linear-gradient(top, #de5a4f 0%, #de5a4f 100%);
                                        background: linear-gradient(to bottom, #de5a4f 0%, #de5a4f 100%);
                                    }
                                }
                            </style>
                    </head>
                    <body style="margin: 0; padding: 0;">
                        <div>
                            <div style="display: flex;flex: 0 0 100%;background:none;padding: 10px 0;flex-direction: column;">
                                <a href="http://www.foodiiz.com/" target="_blank" style="margin: 0 auto;">
                                    <img width="200px" src="' . $imageFolder . 'web_logo.png" alt="Foodiiz">
                                </a>
                            </div>
                            <table style="width: 100%;">
                                <tbody style="padding: 0 10px;">                                 

                                    ' . $bodyText . '
                                    <tr><th>Don´t be shy and share Foodiiz with your friends</th></tr>
                                    <tr><th>--</th></tr>
                                    <tr><th>Thanks</th></tr>
                                    <tr><th>The Foodiiz Team</th></tr>
                                </tbody>
                            </table>
                            <div style="display: flex; flex-direction: column; background-color:#f5f5f5; padding: 10px 0; height: auto;">
                                <div style="width: 100%;margin: 0 auto;">
                                    <p style="width: 100%; text-align: center;">
                                        <a href="https://www.facebook.com/foodiizofficial/" target="_blank" style="text-decoration: none;">
                                            <img src="' . $imageFolder . 'mini-facebook-logo.png" title="Facebook" style="border-radius:50%;margin:5px" width="35" height="35">
                                        </a>
                                        <a href="https://www.instagram.com/foodiizofficiall/" target="_blank" style="text-decoration: none;">
                                            <img src="' . $imageFolder . 'mini-instagram-logo.png" title="Instagram" style="border-radius:50%;margin:5px" width="35" height="35">
                                        </a>
                                        <a href="https://twitter.com/foodiizofficial" target="_blank" style="text-decoration: none;">
                                            <img src="' . $imageFolder . 'mini-twitter-logo.png" title="Twitter" style="border-radius:50%;margin:5px" width="35">
                                        </a>
                                    </p>
                                    <p style="width: 100%; display: block; color: #484848;text-align: center;font-weight: bold;">
                                        Copyright ' . $year . ' &copy; All Rights Reserved.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </body>
                </html>';
        return $text;
    }

}
