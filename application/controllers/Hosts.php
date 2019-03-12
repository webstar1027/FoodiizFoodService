<?php

defined('BASEPATH') OR exit('No direct script access allowed');

class Hosts extends CI_Controller {

    function __construct() {
        parent::__construct();
        $this->load->model('hosts_model', '', TRUE);
        $this->load->model('stripe/paymentmodel', 'payment', TRUE);
        $this->load->library('session');
        $this->load->library('mail');
    }

    public function getCurrencyAmount() {
        $data = array(
            'amount' => $this->input->post('amount'),
            'fromcurrency' => $this->input->post('fromcurrency'),
            'tocurrency' => $this->input->post('tocurrency')
        );
        $result = $this->hosts_model->convertCurrency($data['amount'], $data['fromcurrency'], $data['tocurrency']);
        echo json_encode(array(
            "amount" => $result
        ));
    }

    public function save() {
        $user = $this->session->userdata('user_session');
        $id_user = $user['id'];
        $status = $this->input->post('status');
        $id = $this->input->post('id');
        $title = $this->input->post('title'); 
        $title = str_replace("'", "&#39;", $title); 
        $menu = $this->input->post('menu');
        $menu = str_replace("'", "&#39;", $menu);
        $description = $this->input->post('description');
        $description = str_replace("'", "&#39;", $description);
        $after_activity = $this->input->post('after_activity');
        $after_activity = str_replace("'", "&#39;", $after_activity);
        $data = array(
            'id_user' => $id_user,
            'experience' => json_encode($this->input->post('experiences')),
            'cuisine' => json_encode($this->input->post('cuisines')),
            'min_guests' => $this->input->post('min_guests'),
            'max_guests' => $this->input->post('max_guests'),
            'title' => $title,
            'description' => $description,
            'menu' => $menu,
            'after_activity' => $after_activity,
            'accommodations' => json_encode($this->input->post('accommodations')),
            'drinks' => json_encode($this->input->post('drinks')),
            'diets' => json_encode($this->input->post('diets')),
            'current_city' => $this->input->post('current_city'),
            'address' => $this->input->post('address'),
            'city_name' => $this->input->post('city_name'),
            'venue_type' => $this->input->post('venue_type'),
            'lng' => $this->input->post('lng'),
            'lat' => $this->input->post('lat'),
            'currency' => $this->input->post('currency'),
            'price' => $this->input->post('price'),
            'free' => $this->input->post('free'),
            'hide_guests' => $this->input->post('hide_guests'),
            'last_minute' => $this->input->post('last_minute'),
            'open_hour' => $this->input->post('open_hour'),
            'close_hour' => $this->input->post('close_hour'),
            'status' => $status
        );
        $dates = $this->input->post('dates');
        $result = $this->hosts_model->register($data, $dates, $id);
        if ($result) {
            $name = $user['first_name'];
            $data = array();
            if ($id == "") {
                $subject = "Your event " . $this->input->post('title') . " has been created successfuly.";
                //Email details
                $text = "Review your event details";
                $url = base_url() . 'home/hostsnew/' . $result;
                $link = $this->mail->button($url, $text);
                $data = ["Hello " . $name . "!",
                    "Your event " . $this->input->post('title') . " has been created successfuly.",
                    "Please wait until the administrator approve your event",
                    "You can review your changes in the following link:",
                    $link];
            } else if ($id == "" && $status == "revision") {
                $subject = "Your event " . $this->input->post('title') . " has been created and submitted for revision.";
                //Email details
                $text = "Review your event details";
                $url = base_url() . 'home/hostsnew/' . $result;
                $link = $this->mail->button($url, $text);
                $data = ["Hello " . $name . "!",
                    "Your event " . $this->input->post('title') . " has been created and submitted for revision.",
                    "Please wait until the administrator approve your event",
                    "You can review your changes in the following link:",
                    $link];
                //Admin notification
                $admin_url = "https://admin.foodiiz.com/events/edit/" . $result;
                $edit_link = $this->mail->button($admin_url, "Review the event");
                $admin_data = ["A new event has been submitted for review",
                    "You can review the event details in the following link:",
                    $edit_link];
                $this->notifyAdmin($admin_data);
            } else if ($id != "" && $status == "draft") {
                $subject = "Your event " . $this->input->post('title') . " has been updated successfuly.";
                //Email details
                $text = "Review your event details";
                $url = base_url() . 'home/hostsnew/' . $id;
                $link = $this->mail->button($url, $text);
                $data = ["Hello " . $name . "!",
                    "Your event " . $this->input->post('title') . " has been updated successfuly.",
                    "Please wait until the administrator approve your event",
                    "You can review your changes in the following link:",
                    $link];
            } else if ($id != "" && $status == "revision") {
                $subject = "Your event " . $this->input->post('title') . " has been submitted for revision.";
                //Email details
                $text = "Review your event details";
                $url = base_url() . 'home/hostsnew/' . $id;
                $link = $this->mail->button($url, $text);
                $data = ["Hello " . $name . "!",
                    "Your event " . $this->input->post('title') . " has been submitted for revision.",
                    "Please wait until the administrator approve your event",
                    "You can review your changes in the following link:",
                    $link];
                //Admin notification
                $admin_url = "https://admin.foodiiz.com/events/edit/" . $id;
                $edit_link = $this->mail->button($admin_url, "Review the event");
                $admin_data = ["A new event has been submitted for review",
                    "You can review the event details in the following link:",
                    $edit_link];
                $this->notifyAdmin($admin_data);
            }
            $to = $user['email'];
            $this->mail->create($data, $to, $subject);

            echo json_encode(array(
                "id_host" => $result,
                "response" => "success"
            ));
        } else {
            echo json_encode(array(
                "response" => "failed"
            ));
        }
    }

    function notifyAdmin($data) {
        $subject = "A new event has been submitted for review.";
        $to = "event@foodiiz.com";
        $this->mail->create($data, $to, $subject);
    }

    /**
     * @return object
     */
    public function getHostUser() {
        $user = $this->session->userdata('user_session');
        $id = $user['id'];
        $result = $this->hosts_model->getHostUser($id);
        echo json_encode(array(
            "hosts" => $result
        ));
    }

    public function getGuestExperiences() {
        $user = $this->session->userdata('user_session');
        $id = $user['id'];
        $result = $this->hosts_model->getGuestExperiences($id);
        echo json_encode(array(
            "experiences" => $result
        ));
    }

    public function eventFreeReservation() {
        $user = $this->session->userdata('user_session');
        $id_user = $user['id'];
        $token = substr(md5(uniqid(mt_rand(), true)), 0, 20);
        $payment_id = substr(md5(uniqid(mt_rand(), true)), 0, 20);
        // this line will be reached if no error was thrown above
        $paymentdata = array(
            'payment_id' => $payment_id,
            'reservation_token' => $token,
            'payment_status' => 'success',
            'total' => $this->input->post('amount'),
            'currency' => $this->input->post('currency'),
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
                "Notes from guest: " . $this->input->post('notes'),
                "Guest phone: " . $this->input->post('phone')];
            $subject = 'Excellent news, you have a reservation request from ' . $this->input->post('first_name');
            $this->mail->create($data, $to, $subject);

            //Guest email
            $to = $this->input->post('guest_email');
            $text = "See your itinerary here";
            $url = base_url() . 'itinerary/' . $token;
            $link = $this->mail->button($url, $text);
            $data = ["Hello " . $this->input->post('first_name') . "!",
                $this->input->post('host_name') . " has approved your reservation for the event " . $this->input->post('title') . " on the " . $this->input->post('formated_date'),
                "Notes: " . $this->input->post('notes'),
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
    }

    /**
     * @return object
     */
    public function getHostbyUserId() {
        $user = $this->session->userdata('user_session');
        $user_id = $user['id'];
        $event_id = $this->input->post('id');
        $result = $this->hosts_model->getHostbyUserId($event_id, $user_id);
        echo json_encode(array(
            "hosts" => $result
        ));
    }

    /**
     * @return object
     */
    public function getHostIdUser() {
        $user = $this->session->userdata('user_session');
        $id = $this->input->post('id');
        $id = $id['data'];
        $id_user = $user['id'];
        $result = $this->hosts_model->getHostIdUser($id, $id_user);
        echo json_encode(array(
            "hosts" => $result
        ));
    }

    /**
     * @return object
     */
    public function getHostbyId() {
        $id = $this->input->post('id');
        $result = $this->hosts_model->getHostbyId($id);
        echo json_encode(array(
            "hosts" => $result
        ));
    }

    public function getHostbyIdAndDate() {
        $id = $this->input->post('id');
        $date = $this->input->post('date');
        $result = $this->hosts_model->getHostbyIdAndDate($id, $date);
        echo json_encode(array(
            "hosts" => $result
        ));
    }

    public function getInineraryByToken() {
        $user = $this->session->userdata('user_session');
        $id_user = $user['id'];
        $token = $this->input->post('token');
        $result = $this->hosts_model->getInineraryByToken($id_user, $token);
        echo json_encode(array(
            "event" => $result
        ));
    }

    /**
     * @name saveImage
     */
    public function saveImage() {
        if (!empty($_FILES)) {
            $file_element_name = "file";
            $config['upload_path'] = './assets/images/hosts/';
            $config['allowed_types'] = '*';
            $config['max_size'] = 100000;
            $config['encrypt_name'] = TRUE;
            $this->load->library('upload', $config);
            if (!$this->upload->do_upload($file_element_name)) {
                echo json_encode(array(
                    "response" => "failed"
                ));
            } else {
                $this->load->library('image_lib');
                $upload_data = $this->upload->data();
                $image_width = $upload_data['image_width'];
                $image_height = $upload_data['image_height'];
                $id_host = $this->input->post('id_host');
                $image_path = 'assets/images/hosts/' . $upload_data['file_name'];
                $config['image_library'] = 'gd2';
                $config['source_image'] = $upload_data['full_path'];
                $config['maintain_ratio'] = TRUE;
                $config['width'] = 387 * ($image_width / $image_height);
                $config['height'] = 387;
                $this->image_lib->clear();
                $this->image_lib->initialize($config);
                $this->image_lib->resize();
                $this->hosts_model->saveImage($id_host, $image_path);
                @unlink($_FILES[$file_element_name]);
                echo json_encode(array(
                    "response" => "success"
                ));
            }
        }
    }

    public function getHostsByLocation() {
        $data = array(
            'lat' => $this->input->post('lat'),
            'lng' => $this->input->post('lng'),
            'distance' => $this->input->post('distance'),
            'date' => $this->input->post('date'),
            'location' => $this->input->post('location')
        );
        $result = $this->hosts_model->getHostsByLocation($data);
        echo json_encode(array(
            "hosts" => $result
        ));
    }

    public function getEventsDates() {
        $user = $this->session->userdata('user_session');
        $id_user = $user['id'];
        $result = $this->hosts_model->getEventsDates($id_user);
        echo json_encode(array(
            "dates" => $result
        ));
    }

    public function addRate() {
        $user = $this->session->userdata('user_session');
        $comment = $this->input->post('comment'); 
        $comment = str_replace("'", "&#39;", $comment); 
        $data = array(
            'event_id' => $this->input->post('event_id'),
            'review_from' => $user['id'],
            'review_to' => $this->input->post('review_to'),
            'stars' => $this->input->post('stars'),
            'comment' => $comment,
            'date' => $this->input->post('date')
        );
        $reservation_token = $this->input->post('reservation_token');
        $result = $this->hosts_model->addRate($data, $reservation_token);
        if ($result) {
            echo json_encode(array(
                "response" => "success"
            ));
        } else {
            echo json_encode(array(
                "response" => "failed"
            ));
        }
    }

    public function removeEventImage() {
        $path = $this->input->post('path');
        if (unlink($path)) {
            $this->hosts_model->removeEventImage($path);
            echo json_encode(array(
                "response" => "success"
            ));
        } else {
            echo json_encode(array(
                "response" => "failed"
            ));
        }
    }

    public function updateEvent() {
        $id = $this->input->post('id');
        $date = $this->input->post('date');
        $status = $this->input->post('status');
        $formateddate = $this->input->post('formateddate');
        $result = $this->hosts_model->updateEvent($id, $date, $status);
        if ($result) {
            $guestsList = $this->hosts_model->getEventGuestsLists($id, $date);
            foreach ($guestsList as $guest) {
                $url = base_url() . 'itinerary/' . $guest->reservation_token;
                $to = $guest->guest_email;
                $text = "Confirm here";
                $link = $this->mail->button($url, $text);
                $data = ["Hello " . $guest->guest . "!",
                    $guest->host . " has marked the food experience " . $guest->title . " on " . $formateddate . "as finished.",
                    "We need you to confirm that you have attended this event by using the follow link:",
                    $link];
                $subject = $guest->host . ' has mark the event ' . $guest->title . ' as finished';
                $this->mail->create($data, $to, $subject);
            }
            echo json_encode(array(
                "response" => "success"
            ));
        }
    }

    public function cancelFreeEvent() {
        $id = $this->input->post('id');
        $date = $this->input->post('date');
        $status = $this->input->post('status');
        $formateddate = $this->input->post('formateddate');
        $result = $this->hosts_model->updateEvent($id, $date, $status);
        if ($result) {
            $guestsList = $this->hosts_model->getEventGuestsLists($id, $date);
            foreach ($guestsList as $guest) {
                $url = base_url() . 'itinerary/' . $guest->reservation_token;
                $to = $guest->guest_email;
                $text = "View itinerary here";
                $link = $this->mail->button($url, $text);
                $data = ["Hello " . $guest->guest . "!",
                    $guest->host . " has canceled the food experience " . $guest->title . " on " . $formateddate,
                    "We are very sorry if this causes you some inconvenient.",
                    $link];
                $subject = $guest->host . ' has canceled the event ' . $guest->title;
                $this->mail->create($data, $to, $subject);
            }
            echo json_encode(array(
                "response" => "success"
            ));
        }
    }

    public function getPremiumHosts() {
        $premium_hosts = $this->hosts_model->getPremiumHosts();
        echo json_encode(array(
            "premium_hosts" => $premium_hosts
        ));
    }

}
