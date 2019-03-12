<?php

/**
 * Reservations Status: Approved, Finished, Canceled, Confirmed
 * Payments Status: Success, Refunded
 * 
 */
defined('BASEPATH') OR exit('No direct script access allowed');
require_once(APPPATH . 'libraries/Stripe/lib/Stripe.php');

class Payment extends CI_Controller {

    public function __construct() {
        parent::__construct();
        $this->load->model('stripe/paymentmodel', 'payment', TRUE);
        $this->load->model('hosts_model', '', TRUE);
        $this->load->library('session');
        $this->load->library('mail');
    }

    public function index() {
        $this->load->view('stripe/index');
    }

    public function getCountries() {
        $list = array("DE", "AU", "AT", "BE", "CA", "DK", "ES", "US", "FI", "FR", "HK", "IE", "JP", "LU", "NO", "NZ", "NL", "GB", "SG", "SE", "CH", "IT", "PT");
        echo json_encode(array(
            "response" => "success",
            "countries" => $list
        ));
    }

    public function process() {
        try {
            $receipt_email = $this->input->post('host_email');

            $original_currency = $this->input->post('original_currency');
            $original_price = $this->input->post('original_price') . '00';
            $original_final_price = $this->input->post('original_final_price') . '00';

            $currency = $this->input->post('currency');
            $total_payment = $this->input->post('amount');
            $payment_title = $this->input->post('title');
            $payement_date = $this->input->post('formated_date');
            $payment_token = $this->input->post('access_token');

            Stripe::setApiKey('sk_live_ZNN8b5t65wsrIDCHWK9CKZGl');
            $charge = Stripe_Charge::create(array(
                        "receipt_email" => $receipt_email,
                        "capture" => false,
                        "amount" => $original_final_price,
                        "currency" => $original_currency,
                        "card" => $payment_token,
                        "description" => $payment_title . " Reservation Payment for the date " . $payement_date
            ));
            $user = $this->session->userdata('user_session');
            $id_user = $user['id'];
            $token = substr(md5(uniqid(mt_rand(), true)), 0, 20);
            // this line will be reached if no error was thrown above
            $paymentdata = array(
                'payment_id' => $charge->id,
                'reservation_token' => $token,
                'payment_status' => 'success',
                'total' => $this->input->post('amount'),
                'currency' => $currency,
                'card_number' => $this->input->post('last_four'),
                'description' => $this->input->post('title'),
                'first_name' => $this->input->post('first_name'),
                'last_name' => $this->input->post('last_name'),
                'address' => $this->input->post('address'),
                'created_on' => date('Y-m-d H:i:s'),
                'updated_on' => date('Y-m-d H:i:s')
            );

            $reservationdata = array(
                'event_id' => $this->input->post('event_id'),
                'event_date' => $this->input->post('event_date'),
                'id_host' => $this->input->post('id_host'),
                'id_guest' => $id_user,
                'guests_qty' => $this->input->post('guests_qty'),
                'reservation_status' => 'approved',
                'reservation_token' => $token,
                'notes' => $this->input->post('notes'),
                'phone' => $this->input->post('phone')
            );

            $response = $this->payment->insert($paymentdata, $reservationdata);
            if ($response) {
                //Host email
                $to = $this->input->post('host_email');
                $data = ["Hello " . $this->input->post('host_name'),
                    "Excellent news, you have a reservation request from " . $this->input->post('first_name'),
                    $this->input->post('first_name') . " has reserved " . $this->input->post('guests_qty') . " seat(s) on your event " . $this->input->post('title') . " on the " . $this->input->post('formated_date'),
                    " Based on your price, your estimated payment for this event is " . $currency . " " . $this->input->post('amount')];
                $subject = 'Excellent news, you have a reservation request from ' . $this->input->post('first_name');
                $this->mail->create($data, $to, $subject);
                //Guest email
                $url = base_url() . 'itinerary/' . $token;
                $to = $this->input->post('guest_email');
                $text = "See your itinerary here";
                $link = $this->mail->button($url, $text);
                $data = ["Hello " . $this->input->post('first_name'),
                    $this->input->post('host_name') . " has approved your reservation for the event " . $this->input->post('title') . " on the " . $this->input->post('formated_date'),
                    "Note from guest: " . $this->input->post('notes'),
                    "Phone: " . $this->input->post('phone'),
                    $link];
                $subject = $this->input->post('host_name') . ' has approved your reservation for the event "' . $this->input->post('title');
                $this->mail->create($data, $to, $subject);
                echo json_encode(array(
                    "response" => "success",
                    "token" => $token
                ));
            } else {
                echo json_encode(array(
                    "response" => "fail"
                ));
            }
        } catch (Stripe_CardError $e) {
            echo json_encode(array('status' => 500, 'error' => STRIPE_FAILED));
            exit();
        } catch (Stripe_InvalidRequestError $e) {
            // Invalid parameters were supplied to Stripe's API
            echo json_encode(array('status' => 500, 'error' => $e->getMessage()));
            exit();
        } catch (Stripe_AuthenticationError $e) {
            // Authentication with Stripe's API failed
            echo json_encode(array('status' => 500, 'error' => AUTHENTICATION_STRIPE_FAILED));
            exit();
        } catch (Stripe_ApiConnectionError $e) {
            // Network communication with Stripe failed
            echo json_encode(array('status' => 500, 'error' => NETWORK_STRIPE_FAILED));
            exit();
        } catch (Stripe_Error $e) {
            // Display a very generic error to the user, and maybe send
            echo json_encode(array('status' => 500, 'error' => STRIPE_FAILED));
            exit();
        } catch (Exception $e) {
            // Something else happened, completely unrelated to Stripe
            echo json_encode(array('status' => 500, 'error' => STRIPE_FAILED));
            exit();
        }
    }

    public function eventCancelation() {
        try {
            Stripe::setApiKey('sk_live_ZNN8b5t65wsrIDCHWK9CKZGl');
            $charge = Stripe_Charge::create(array(
                        "receipt_email" => "xnehilorx@gmail.com",
                        "capture" => false,
                        "amount" => $this->input->post('amount'),
                        "currency" => "USD",
                        "card" => $this->input->post('access_token'),
                        "description" => "Event Cancelation: " . $this->input->post('detail')
            ));
            $user = $this->session->userdata('user_session');
            $id_user = $user['id'];
            $date = date('Y-m-d H:i:s');
            // this line will be reached if no error was thrown above
            $amount = number_format((float) ($this->input->post('amount') / 100), 2, '.', '');
            $formateddate = $this->input->post('formateddate');
            $paymentdata = array(
                'payment_id' => $charge->id,
                'id_host' => $id_user,
                'event_id' => $this->input->post('event_id'),
                'detail' => "Event Cancelation: " . $this->input->post('detail'),
                'event_date' => $this->input->post('event_date'),
                'total' => $amount,
                'card_number' => $this->input->post('last_four'),
                'date' => $date
            );
            $this->hosts_model->updateEvent($this->input->post('event_id'), $this->input->post('event_date'), 'canceled');
            $response = $this->payment->eventCancelation($paymentdata);
            if ($response) {
                Stripe::setApiKey('sk_live_ZNN8b5t65wsrIDCHWK9CKZGl');
                $guestsList = $this->hosts_model->getEventGuestsLists($this->input->post('event_id'), $this->input->post('event_date'));
                foreach ($guestsList as $guest) {
                    $ch = Stripe_Charge::retrieve($guest->payment_id);
                    $ch->refunds->create();
                    $url = base_url() . 'itinerary/' . $guest->reservation_token;
                    $this->hosts_model->updatedRefundPayment($guest->payment_id, 'refunded');
                    $to = $guest->guest_email;
                    $text = "See itinerary here";
                    $link = $this->mail->button($url, $text);
                    $data = ["Hello " . $guest->guest . "!",
                        $guest->host . " has canceled the food experience " . $guest->title . " on " . $formateddate,
                        "We are very sorry if this causes you some inconvenient",
                        "You will receive the full refund within the next 72h.",
                        "You are almost ready to get started with an extraordinary food experience. Please confirm your email address so we know you are a real Foodiiz friend.",
                        $link];
                    $subject = $guest->host . ' has canceled the the food experience ' . $guest->title;
                    $this->mail->create($data, $to, $subject);
                }
                echo json_encode(array(
                    "response" => "success"
                ));
            } else {
                echo json_encode(array(
                    "response" => "fail"
                ));
            }
        } catch (Stripe_CardError $e) {
            echo json_encode(array('status' => 500, 'error' => STRIPE_FAILED));
            exit();
        } catch (Stripe_InvalidRequestError $e) {
            // Invalid parameters were supplied to Stripe's API
            echo json_encode(array('status' => 500, 'error' => $e->getMessage()));
            exit();
        } catch (Stripe_AuthenticationError $e) {
            // Authentication with Stripe's API failed
            echo json_encode(array('status' => 500, 'error' => AUTHENTICATION_STRIPE_FAILED));
            exit();
        } catch (Stripe_ApiConnectionError $e) {
            // Network communication with Stripe failed
            echo json_encode(array('status' => 500, 'error' => NETWORK_STRIPE_FAILED));
            exit();
        } catch (Stripe_Error $e) {
            // Display a very generic error to the user, and maybe send
            echo json_encode(array('status' => 500, 'error' => STRIPE_FAILED));
            exit();
        } catch (Exception $e) {
            // Something else happened, completely unrelated to Stripe
            echo json_encode(array('status' => 500, 'error' => STRIPE_FAILED));
            exit();
        }
    }

    public function guestEventCancelation() {
        try {
            $token = $this->input->post('token');
            $message = $this->input->post('message');
            $response = $this->payment->guestEventCancelation($token);
            if ($response) {
                $response = $this->payment->getPaymentId($token);
                $payment_id = $response[0]->payment_id;
                Stripe::setApiKey('sk_live_ZNN8b5t65wsrIDCHWK9CKZGl');
                $ch = Stripe_Charge::retrieve($payment_id);
                $ch->refunds->create();
                $url = base_url() . 'itinerary/' . $token;
                $this->hosts_model->updatedRefundPayment($payment_id, 'refunded');
                $reservation_details = $this->hosts_model->getReservationRefundDetails($token);
                $event_id = $reservation_details[0]->id;
                $date = $reservation_details[0]->event_date;
                $this->hosts_model->updatedRefundReservation($reservation_details[0]->id, 'canceled');
                $formateddate = date("F", strtotime($reservation_details[0]->event_date)) . ' ' . date("d", strtotime($reservation_details[0]->event_date)) . ', ' . date("Y", strtotime($reservation_details[0]->event_date));
                //Guest email
                $to = $reservation_details[0]->guest_email;
                $text = "See details here";
                $link = $this->mail->button($url, $text);
                $data = ["Hello " . $reservation_details[0]->guest_name . "!",
                    "You have canceled the food experience " . $reservation_details[0]->title . " on " . $formateddate,
                    "We are very sorry if this causes you some inconvenient.",
                    $message,
                    $link];
                $subject = 'You have canceled the food experience ' . $reservation_details[0]->title;
                $this->mail->create($data, $to, $subject);
                //Host email
                $to = $reservation_details[0]->host_email;
                $data = ["Hello " . $reservation_details[0]->host_name,
                    $reservation_details[0]->guest_name . " has canceled the food experience " . $reservation_details[0]->title . " on " . $formateddate,
                    "We are very sorry if this causes you some inconvenient.",
                    $message];
                $subject = $reservation_details[0]->guest_name . ' has canceled the the food experience ' . $reservation_details[0]->title;
                $this->mail->create($data, $to, $subject);
                echo json_encode(array(
                    "response" => "success"
                ));
            } else {
                echo json_encode(array(
                    "response" => "fail"
                ));
            }
        } catch (Stripe_CardError $e) {
            echo json_encode(array('status' => 500, 'error' => STRIPE_FAILED));
            exit();
        } catch (Stripe_InvalidRequestError $e) {
            // Invalid parameters were supplied to Stripe's API
            echo json_encode(array('status' => 500, 'error' => $e->getMessage()));
            exit();
        } catch (Stripe_AuthenticationError $e) {
            // Authentication with Stripe's API failed
            echo json_encode(array('status' => 500, 'error' => AUTHENTICATION_STRIPE_FAILED));
            exit();
        } catch (Stripe_ApiConnectionError $e) {
            // Network communication with Stripe failed
            echo json_encode(array('status' => 500, 'error' => NETWORK_STRIPE_FAILED));
            exit();
        } catch (Stripe_Error $e) {
            // Display a very generic error to the user, and maybe send
            echo json_encode(array('status' => 500, 'error' => STRIPE_FAILED));
            exit();
        } catch (Exception $e) {
            // Something else happened, completely unrelated to Stripe
            echo json_encode(array('status' => 500, 'error' => STRIPE_FAILED));
            exit();
        }
    }

    public function guestFreeEventCancelation() {
        $token = $this->input->post('token');
        $reservation_details = $this->hosts_model->getReservationRefundDetails($token);
        $event_id = $reservation_details[0]->id;
        $date = $reservation_details[0]->event_date;
        $response = $this->hosts_model->updatedRefundReservation($reservation_details[0]->id, 'canceled');
        if ($response) {
            $url = base_url() . 'itinerary/' . $token;
            $formateddate = date("F", strtotime($reservation_details[0]->event_date)) . ' ' . date("d", strtotime($reservation_details[0]->event_date)) . ', ' . date("Y", strtotime($reservation_details[0]->event_date));
            $to = $this->input->post('email');
            $text = "See details here";
            $link = $this->mail->button($url, $text);
            $data = ["Hello " . $reservation_details[0]->guest_name . "!",
                "You have canceled the food experience " . $reservation_details[0]->title . " on " . $formateddate,
                "We are very sorry if this causes you some inconvenient.",
                "You are not entitled to any return, credit or reimbursement since this is a free Food Experience.",
                $link];
            $subject = "You have canceled the food experience " . $reservation_details[0]->title;
            $this->mail->create($data, $to, $subject);

            $to = $reservation_details[0]->host_email;
            $data = ["Hello " . $reservation_details[0]->host_name . "!",
                $reservation_details[0]->guest_name . "has canceled the food experience " . $reservation_details[0]->title . " on " . $formateddate,
                "We are very sorry if this causes you some inconvenient.",
                "The guest is not going to be entitled to any return, credit or reimbursement since this is a free Food Experience."];
            $subject = $reservation_details[0]->guest_name . ' has canceled the the food experience ' . $reservation_details[0]->title;
            $this->mail->create($data, $to, $subject);
            echo json_encode(array(
                "response" => "success"
            ));
        }
    }

    public function guestEventCancelationNoRefund() {
        try {
            $token = $this->input->post('token');
            $message = $this->input->post('message');
            $reservation_details = $this->hosts_model->getReservationRefundDetails($token);
            $event_id = $reservation_details[0]->id;
            $date = $reservation_details[0]->event_date;
            $response = $this->hosts_model->updatedRefundReservation($reservation_details[0]->id, 'canceled');
            if ($response) {
                $url = base_url() . 'itinerary/' . $token;
                $formateddate = date("F", strtotime($reservation_details[0]->event_date)) . ' ' . date("d", strtotime($reservation_details[0]->event_date)) . ', ' . date("Y", strtotime($reservation_details[0]->event_date));
                //Guest email
                $to = $reservation_details[0]->guest_email;
                $text = "See details here";
                $link = $this->mail->button($url, $text);
                $data = ["Hello " . $reservation_details[0]->guest_name,
                    "You have canceled the food experience " . $reservation_details[0]->title . " on " . $formateddate,
                    "We are very sorry if this causes you some inconvenient.",
                    "You are not entitled to any return, credit or reimbursement since the date is less than 48 hours before the applicable Food Experience.",
                    $link];
                $subject = 'You have canceled the food experience ' . $reservation_details[0]->title;
                $this->mail->create($data, $to, $subject);
                //Host email
                $to = $reservation_details[0]->host_email;
                $data = ["Hello " . $reservation_details[0]->host_name,
                    $reservation_details[0]->guest_name . " has canceled the food experience " . $reservation_details[0]->title . " on " . $formateddate,
                    "We are very sorry if this causes you some inconvenient.",
                    "The guest is not going to be entitled to any return, credit or reimbursement since the date is less than 48 hours before the applicable Food Experience."];
                $subject = $reservation_details[0]->guest_name . ' has canceled the the food experience ' . $reservation_details[0]->title;
                $this->mail->create($data, $to, $subject);
                echo json_encode(array(
                    "response" => "success"
                ));
            } else {
                echo json_encode(array(
                    "response" => "fail"
                ));
            }
        } catch (Stripe_CardError $e) {
            echo json_encode(array('status' => 500, 'error' => STRIPE_FAILED));
            exit();
        } catch (Stripe_InvalidRequestError $e) {
            // Invalid parameters were supplied to Stripe's API
            echo json_encode(array('status' => 500, 'error' => $e->getMessage()));
            exit();
        } catch (Stripe_AuthenticationError $e) {
            // Authentication with Stripe's API failed
            echo json_encode(array('status' => 500, 'error' => AUTHENTICATION_STRIPE_FAILED));
            exit();
        } catch (Stripe_ApiConnectionError $e) {
            // Network communication with Stripe failed
            echo json_encode(array('status' => 500, 'error' => NETWORK_STRIPE_FAILED));
            exit();
        } catch (Stripe_Error $e) {
            // Display a very generic error to the user, and maybe send
            echo json_encode(array('status' => 500, 'error' => STRIPE_FAILED));
            exit();
        } catch (Exception $e) {
            // Something else happened, completely unrelated to Stripe
            echo json_encode(array('status' => 500, 'error' => STRIPE_FAILED));
            exit();
        }
    }

    public function hostEventCancelation() {
        try {
            $token = $this->input->post('token');
            $response = $this->payment->guestEventCancelation($token);
            if ($response) {
                $response = $this->payment->getPaymentId($token);
                $payment_id = $response[0]->payment_id;
                Stripe::setApiKey('sk_live_ZNN8b5t65wsrIDCHWK9CKZGl');
                $ch = Stripe_Charge::retrieve($payment_id);
                $ch->refunds->create();
                $url = base_url() . 'itinerary/' . $token;
                $this->hosts_model->updatedRefundPayment($payment_id, 'refunded');
                $reservation_details = $this->hosts_model->getReservationRefundDetails($token);
                $event_id = $reservation_details[0]->id;
                $date = $reservation_details[0]->event_date;
                $this->hosts_model->updatedRefundReservation($reservation_details[0]->id, 'canceled');
                $formateddate = date("F", strtotime($reservation_details[0]->event_date)) . ' ' . date("d", strtotime($reservation_details[0]->event_date)) . ', ' . date("Y", strtotime($reservation_details[0]->event_date));
                //Guest email
                $to = $reservation_details[0]->guest_email;
                $text = "See details here";
                $link = $this->mail->button($url, $text);
                $data = ["Hello " . $reservation_details[0]->guest_name . "!",
                    "Your reservation for the event " . $reservation_details[0]->title . " on " . $formateddate . " has been canceled by " . $reservation_details[0]->host_name,
                    "We are very sorry if this causes you some inconvenient.",
                    $link];
                $subject = "You have canceled the food experience " . $reservation_details[0]->title;
                $this->mail->create($data, $to, $subject);
                //Hoest email
                $to = $reservation_details[0]->host_email;
                $data = ["Hello " . $reservation_details[0]->host_name,
                    "You have canceled the reservation for the food experience " . $reservation_details[0]->title . " on " . $formateddate . " for " . $reservation_details[0]->guest_name,
                    "We are very sorry if this causes you some inconvenient."];
                $subject = "You have canceled the reservation for the food experience " . $reservation_details[0]->title . " on " . $formateddate . " for " . $reservation_details[0]->guest_name;
                $this->mail->create($data, $to, $subject);
                echo json_encode(array(
                    "response" => "success"
                ));
            } else {
                echo json_encode(array(
                    "response" => "fail"
                ));
            }
        } catch (Stripe_CardError $e) {
            echo json_encode(array('status' => 500, 'error' => STRIPE_FAILED));
            exit();
        } catch (Stripe_InvalidRequestError $e) {
            // Invalid parameters were supplied to Stripe's API
            echo json_encode(array('status' => 500, 'error' => $e->getMessage()));
            exit();
        } catch (Stripe_AuthenticationError $e) {
            // Authentication with Stripe's API failed
            echo json_encode(array('status' => 500, 'error' => AUTHENTICATION_STRIPE_FAILED));
            exit();
        } catch (Stripe_ApiConnectionError $e) {
            // Network communication with Stripe failed
            echo json_encode(array('status' => 500, 'error' => NETWORK_STRIPE_FAILED));
            exit();
        } catch (Stripe_Error $e) {
            // Display a very generic error to the user, and maybe send
            echo json_encode(array('status' => 500, 'error' => STRIPE_FAILED));
            exit();
        } catch (Exception $e) {
            // Something else happened, completely unrelated to Stripe
            echo json_encode(array('status' => 500, 'error' => STRIPE_FAILED));
            exit();
        }
    }

    public function success() {
        $this->load->view('stripe/success');
    }

    public function getStripePermissions() {
        $code = $this->input->post('code');
        define('CLIENT_ID', 'ca_BRG07Lm29qyPDWkaVY1Oz0FAg63vCHMR');
        define('API_KEY', 'sk_live_ZNN8b5t65wsrIDCHWK9CKZGl');
        define('TOKEN_URI', 'https://connect.stripe.com/oauth/token');
        define('AUTHORIZE_URI', 'https://connect.stripe.com/oauth/authorize');
        //Request body
        $token_request_body = array(
            'client_secret' => API_KEY,
            'grant_type' => 'authorization_code',
            'client_id' => CLIENT_ID,
            'code' => $code,
        );
        $req = curl_init(TOKEN_URI);
        //curl_setopt($req, CURLOPT_SSL_VERIFYHOST, 0);
        //curl_setopt($req, CURLOPT_SSL_VERIFYPEER, 0);
        curl_setopt($req, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($req, CURLOPT_POST, true);
        curl_setopt($req, CURLOPT_POSTFIELDS, http_build_query($token_request_body));
        // TODO: Additional error handling
        curl_getinfo($req, CURLINFO_HTTP_CODE);
        $resp = json_decode(curl_exec($req), true);
        curl_close($req);
        echo json_encode(array(
            "stripe_details" => $resp
        ));
    }

    public function test() {
        exit();
        $endpoint = 'convert';
        $access_key = 'f81b74edd45178fefe42856cf7385115';
        $from = 'EUR';
        $to = 'USD';
        $amount = 100;
        // initialize CURL:
        $url = 'https://apilayer.net/api/' . $endpoint . '?access_key=' . $access_key . '&from=' . $from . '&to=' . $to . '&amount=' . $amount;
        $json = file_get_contents($url);
        $obj = json_decode($json);
        echo round($obj->result);
        exit();
    }

    /*public function sendMails() {
        $emails = ["xnehilorx@gmail.com", "francescapantano1@gmail.com", "maffionevincenzo88@gmail.com", "rene982@hotmail.com", "shakhboz@gmail.com", "remimonneau@gmail.com", "b.laloy@laposte.net", "spadarialessandro@gmail.com", "fran.casalino@gmail.com", "teresa_batista_66@virgilio.it", "vacanze_romaneee@yahoo.com", "cillaria@gmail.com", "s.trincali@hotmail.com", "myrthamayasari1@gmail.com", "richard.rendik@gmail.com", "veganterinayekaterina@gmail.com", "lametadisei@gmail.com", "mariadellolio60@icloud.com", "mpourdan@gmail.com", "delighted.pl@gmail.com", "moduhrayshun@gmail.com", "pparamit@wellesley.edu", "eizelle.eats.out@gmail.com", "jemima.myers@outlook.com", "metax.foodies.diary@gmail.com", "gianna.brachetti@onmeda.de", "arqmfgarcia@gmail.com", "nstanton328@gmail.com", "tiiloo@lott.com", "claudia.schmid1982@gmail.com", "ayoubelias455@gmail.com", "mona@sparlinek.de", "svanbruggen@kcvblaw.com", "mehtaceilings@hotmail.com", "mcw.itherington@gmail.com", "lihmanrafi@icloud.com", "mistermave@gmail.com", "fabiog_1981@yahoo.it", "mia.taylor1994@gmail.com", "lorenasanqui@yahoo.com", "simonabruzzo2@gmail.com", "sandrosvalduz@gmail.com", "wilhelmsson.per@gmail.com", "chef.mychan@gmail.com", "consales@mac.com", "efsane.uyar@outlook.com", "helena.svendsen1@gmail.com", "alessandro.aloisi4@gmail.com", "n_hekmat@hotmail.com", "darteq@gmail.com", "jasna.kusic@yahoo.com", "larucciad@gmail.com", "rickard.chiem@gmail.com", "carlogiuliano1010@gmail.com", "martina.catto@gmail.com", "pantaleocappelluti57@gmail.com", "menelao@getnada.com", "imperatorefavalli@hotmail.it", "mariah86@hotmail.it", "fabiluk@yahoo.com", "milena-lorusso@virgilio.it", "sol_da_tojeune@hotmail.it", "sabrinam1@hotmail.it", "kellyitalia2010@hotmail.com", "maricuzza.lopez93@gmail.com", "ladypippa87@gmail.com", "levanshvili@gmail.com", "lisetta7912@gmail.com", "lucapremi83@gmail.com", "aceonstars@gmail.com", "tmbilel@live.com", "kristian-nilsson@hotmail.com"];
        $url = base_url();
        $text = "CLICK HERE TO REGISTER";
        $link = $this->mail->button($url, $text);
        $data = ["Hello,",
            "Thank you to be part of the Foodiiz community, we are really happy to inform you that we are finally live!",
            "To celebrate this moment we launched our PREMIUM PROGRAMME and for both HOST and Guests that will create or book an event we will send our welcome Foodiiz kit for free and will give strong visibility in our Premium home page Host list and in our marketing campaigns!",
            "Our welcome pack are limited to the first 100 hosts and 100 guests so, HURRY UP don´t miss your chance.",
            $link];
        $subject = 'Thank you to be part of the Foodiiz community, we are really happy to inform you that we are finally live!';
        foreach ($emails as $to) {
            $this->mail->create($data, $to, $subject);
        }
    }*/

    function executePayments() {
        $events = array();
        $records = $this->hosts_model->executePayments();
        foreach ($records as $event) {
            if (count($event->reservations) > 0) {
                //Free events
                if ($event->free == "1") {
                    foreach ($event->reservations as $reservation) {
                        $this->finishGuestEvent($event, $reservation);
                    }
                    $this->finishHostFreeEvent($event);
                    $this->hosts_model->updateEvent($event->id_event, $event->event_date, 'paid');
                } else {
                    foreach ($event->reservations as $reservation) {
                        $this->finishGuestEvent($event, $reservation);
                    }
                    //If there is payment method
                    if ($event->has_method) {
                        if ($event->method == 'stripe') {
                            $this->applyStripePayment($event->pay_to_host, $event->currency, $event->stripe_account['account_id']);
                            $this->finishHostEvent($event);
                            $this->hosts_model->updateEvent($event->id_event, $event->event_date, 'paid');
                        }
                    } else {
                        
                    }
                    $events[] = $event;
                }
            } else {
                if ($event->free == "1") {
                    $this->finishHostFreeEvent($event);
                    $this->hosts_model->updateEvent($event->id_event, $event->event_date, 'paid');
                } else {
                    $this->finishHostEvent($event);
                    $this->hosts_model->updateEvent($event->id_event, $event->event_date, 'paid');
                }
            }
        }
        //echo json_encode($events, JSON_PRETTY_PRINT);
        //echo json_encode($records, JSON_PRETTY_PRINT);
        //echo $this->convertCurrency("100.00", "USD", "EUR");
    }

    function applyStripePayment($amount, $currency, $account) {
        Stripe::setApiKey("sk_live_ZNN8b5t65wsrIDCHWK9CKZGl");
        $charge = Stripe_Payout::create(array("amount" => $amount, "currency" => $currency), array("stripe_account" => $account));
    }

    function applyBankPayment($event) {
        
    }

    function sendEmailUserWithoutPaymentMethod($name, $email) {
        
    }

    function finishEvents() {
        $this->hosts_model->finishEvents();
    }

    function finishHostEvent($event) {
        $to = $event->host_email;
        $data = ["Hello " . $event->host_name . "!",
            "The event " . $event->title . " in " . $event->current_city . " on " . $event->event_date . " has finished.",
            "You will receive " . $event->currency . "  " . $event->pay_to_host . " in your " . $event->method . " account in the following days."];
        $subject = 'The event ' . $event->title . ' on ' . $event->event_date . ' has been marked as finished.';
        $this->mail->create($data, $to, $subject);
    }

    function finishHostFreeEvent($event) {
        $to = $event->host_email;
        $data = ["Hello " . $event->host_name . "!",
            "The event " . $event->title . " in " . $event->current_city . " on " . $event->event_date . " has finished."];
        $subject = 'The event ' . $event->title . ' on ' . $event->event_date . ' has been marked as finished.';
        $this->mail->create($data, $to, $subject);
    }

    function finishGuestEvent($event, $reservation) {
        $url = base_url() . 'itinerary/' . $reservation->reservation_token;
        $to = $reservation->email;
        $text = "Leave a review";
        $link = $this->mail->button($url, $text);
        $data = ["Hello " . $reservation->first_name . "!",
            "The event " . $event->title . " in " . $event->current_city . " has finished.",
            $event->host_name . " would like to receive your feedback.",
            $link];
        $subject = 'The event ' . $event->title . ' in ' . $event->current_city . ' has finished.';
        $this->mail->create($data, $to, $subject);
    }

}
