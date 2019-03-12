<?php

Class Hosts_model extends CI_Model {

    function __construct() {
        parent::__construct();
        $this->load->library('session');
        $this->load->library('mail');
    }

    function register($data, $dates, $id) {
        if ($id == "") {
            $this->db->insert('events', $data);
            $id = $this->db->insert_id();
            foreach ($dates as $date) {
                $data = array('id_event' => $id, 'event_date' => $date, 'event_status' => 'open');
                $this->db->insert('events_dates', $data);
            }
            return $id;
        } else {
            foreach ($data as $key => $item) {
                if ($key !== 'id' || $key !== 'currency') {
                    $sql = "update events set $key ='$item' where id='$id'";
                    $this->db->query($sql);
                }
            }
            foreach ($dates as $date) {
                $sql = "SELECT * FROM events_dates where event_date = '$date' and id_event = '$id'";
                $query = $this->db->query($sql);
                if ($query->num_rows() == 0) {
                    $data = array('id_event' => $id, 'event_date' => $date, 'event_status' => 'open');
                    $this->db->insert('events_dates', $data);
                }
            }
            return $id;
        }
    }

    function removeEventImage($path) {
        $sql = "DELETE FROM events_images where image_path = '$path'";
        $query = $this->db->query($sql);
        return $query;
    }

    function getHostUser($id) {
        $sql = "SELECT * FROM events where id_user = '$id'";
        $query = $this->db->query($sql);
        $records = $query->result();
        foreach ($records as $row) {
            $id_host = $row->id;
            $sql2 = "SELECT image_path FROM events_images where id_host = '$id_host' limit 1";
            $query2 = $this->db->query($sql2);
            $row->images = $query2->result();
        }
        return $records;
    }

    function getHostIdUser($id, $id_user) {
        $sql = "SELECT * FROM events where id_user = '$id_user' and id='$id'";
        $query = $this->db->query($sql);
        return $query->result();
    }

    function getHostbyId($id) {
        $sql = "SELECT e.*, u.first_name, u.last_name, u.email, u.genre, u.birthdate, u.phone_number, u.status, u.address FROM events e inner join users u on e.id_user = u.id where e.id = '$id'";
        $query = $this->db->query($sql);
        $records = $query->result();
        foreach ($records as $row) {
            $id_host = $row->id;
            $id_user = $row->id_user;
            $sql2 = "SELECT image_path FROM events_images where id_host = '$id_host'";
            $query2 = $this->db->query($sql2);
            $row->images = $query2->result();

            $sql3 = "SELECT image_path FROM users_images where id_user = '$id_user'";
            $query3 = $this->db->query($sql3);
            $row->images_user = $query3->result();

            $sql4 = "SELECT event_date FROM events_dates where id_event = '$id_host'";
            $query4 = $this->db->query($sql4);
            $row->dates = $query4->result();
        }

        return $records;
    }

    function getHostbyIdAndDate($id, $date) {
        $currency = "";
        $currentSession = $this->session->userdata('user_session');
        if ($currentSession) {
            $currency = $currentSession['currency'];
        } else {
            $currentSession = $this->session->userdata('global');
            $currency = $currentSession['currency'];
        }

        $sql = "SELECT e.*, u.first_name, u.last_name, u.email, u.genre, u.birthdate, u.phone_number, u.status, u.address 'user_address' FROM events e inner join users u on e.id_user = u.id where e.id = '$id'";
        $query = $this->db->query($sql);
        $records = $query->result();
        foreach ($records as $row) {
            $id_host = $row->id;
            $id_user = $row->id_user;

            $row->original_price = $this->getPrice($row->price);
            $row->initial_price = $this->getInitialPrice($row->price);
            $row->price = $this->getPrice($row->price);

            $sql2 = "SELECT image_path FROM events_images where id_host = '$id_host'";
            $query2 = $this->db->query($sql2);
            $row->images = $query2->result();

            $sql3 = "SELECT image_path FROM users_images where id_user = '$id_user'";
            $query3 = $this->db->query($sql3);
            $row->images_user = $query3->result();

            $sql4 = "SELECT event_date FROM events_dates where id_event = '$id_host' and event_status = 'open'";
            $query4 = $this->db->query($sql4);
            if ($query4->num_rows() > 0) {
                $row->dates = $query4->result();
                if ($row->currency !== $currency && $row->free == 0) {
                    $row->price = $this->convertCurrency($row->price, $row->currency, $currency);
                    $row->initial_price = $this->convertCurrency($row->initial_price, $row->currency, $currency);
                }
            } else {
                $row->dates = array();
            }

            $sql5 = "SELECT SUM(guests_qty) as 'total' FROM reservations where event_id = '$id_host' and event_date = '$date' and reservation_status = 'approved'";
            $query5 = $this->db->query($sql5);
            if ($query5->num_rows() > 0) {
                $row->total_reservations = $query5->result()[0]->total;
            } else {
                $row->total_reservations = array();
            }

            //$sql6 = "SELECT DISTINCT r.reservation_token, r.reservation_status, r.guests_qty, u.id 'id_user', CONCAT(u.first_name, ' ', u.last_name) 'guest' FROM reservations r inner join users u on r.id_guest = u.id where r.event_date = '$date' and r.event_id = '$id_host' and r.reservation_status <> 'canceled'";
            $sql6 = "SELECT DISTINCT r.reservation_token, r.reservation_status, r.guests_qty, u.id 'id_user', CONCAT(u.first_name) 'guest', ui.image_path 'image',  rv.id 'allow_review' FROM reservations r inner join users u on r.id_guest = u.id inner join users_images ui on u.id = ui.id_user left join reviews rv on r.event_id = rv.event_id and r.event_date = rv.date and r.id_guest = rv.review_to where r.event_date = '$date' and r.event_id = '$id_host' and r.reservation_status <> 'canceled'";
            $query6 = $this->db->query($sql6);
            if ($query6->num_rows() > 0) {
                $row->guests = $query6->result();
            } else {
                $row->guests = array();
            }

            $sql7 = "SELECT event_status FROM events_dates where id_event = '$id_host' and event_date = '$date'";
            $query7 = $this->db->query($sql7);
            if ($query7->num_rows() > 0) {
                $row->date_status = $query7->result()[0]->event_status;
            } else {
                $row->event_reviews = array();
            }

            $sql8 = "select r.stars, r.comment, r.date, r.review_from, u.first_name, ui.image_path from reviews r left join users u on u.id = r.review_from join users_images ui on ui.id_user = r.review_from where r.event_id = '$id_host'";
            $query8 = $this->db->query($sql8);
            if ($query8->num_rows() > 0) {
                $row->event_reviews = $query8->result();
            } else {
                $row->event_reviews = array();
            }
        }

        return $records;
    }

    function getHostbyUserId($event_id, $user_id) {
        $sql = "SELECT e.*, u.first_name, u.last_name, u.email, u.genre, u.birthdate, u.phone_number, u.status 'user_status', u.active FROM events e inner join users u on e.id_user=u.id where e.id='$event_id' and u.id='$user_id'";
        $query = $this->db->query($sql);
        $records = $query->result();
        $today = date('Y-m-d', mktime(0, 0, 0, date("m"), date("d") - 2, date("Y")));
        foreach ($records as $row) {
            $id_host = $row->id;
            $sql2 = "SELECT id, image_path FROM events_images where id_host = '$id_host'";
            $query2 = $this->db->query($sql2);
            if ($query2->num_rows() > 0) {
                $row->images = $query2->result();
            } else {
                $row->images = array();
            }

            $id_user = $row->id_user;
            $sql3 = "SELECT image_path FROM users_images where id_user = '$id_user'";
            $query3 = $this->db->query($sql3);
            if ($query3->num_rows() > 0) {
                $row->images_user = $query3->result();
            } else {
                $row->images_user = array();
            }

            $sql4 = "SELECT event_date FROM events_dates where id_event = '$event_id' and event_status = 'open' and event_date > '$today'";
            $query4 = $this->db->query($sql4);
            if ($query4->num_rows() > 0) {
                $row->dates = $query4->result();
            } else {
                $row->dates = array();
            }

            $sql5 = "SELECT * FROM reservations where event_id = '$id_host'";
            $query5 = $this->db->query($sql5);
            $row->canModify = $query5->num_rows() === 0 ? true : false;
        }

        return $records;
    }

    function saveImage($id_host, $image_path) {
        $data = array('id_host' => $id_host, 'image_path' => $image_path);
        $this->db->insert('events_images', $data);
    }

    function getGuestExperiences($id) {
        $sql = "SELECT e.title, r.event_id, r.reservation_token, r.reservation_status, r.event_date, u.first_name 'host' FROM reservations r inner join events e on e.id = r.event_id inner join users u on u.id = e.id_user where r.id_guest = '$id'";
        $query = $this->db->query($sql);
        $records = $query->result();
        foreach ($records as $row) {
            $host = $row->event_id;
            $sql2 = "SELECT image_path FROM events_images where id_host = '$host' limit 1";
            $query2 = $this->db->query($sql2);
            $row->image = $query2->result()[0]->image_path;
        }
        return $records;
    }

    function getHostsByLocation($data) {
        //Get currency
        $currency = "";
        $currentSession = $this->session->userdata('user_session');
        if ($currentSession) {
            $currency = $currentSession['currency'];
        } else {
            $currentSession = $this->session->userdata('global');
            $currency = $currentSession['currency'];
        }

        $today = date('Y-m-d', mktime(0, 0, 0, date("m"), date("d"), date("Y")));
        $lat = $data['lat'];
        $lon = $data['lng'];
        $radius = $data['distance']; // Km
        $location = $data['location'];
        $angle_radius = $radius / 111; // Every lat|lon degree° is ~ 111Km
        $min_lat = $lat - $angle_radius;
        $max_lat = $lat + $angle_radius;
        $min_lon = $lon - $angle_radius;
        $max_lon = $lon + $angle_radius;
        $flag = false;
        $flag1 = false;

        $arrayLocation = explode(',', $location);
        
        if (count($arrayLocation) > 2) {
            $flag = true;
        }       
        if ($flag == true) {
            $sql = "SELECT * FROM events WHERE lat BETWEEN $min_lat AND $max_lat AND lng BETWEEN $min_lon AND $max_lon and status = 'approved'";
            $query = $this->db->query($sql);
            $records = $query->result();
            $n_rows = count($records);
            for ($i = 0; $i < $n_rows; $i++) {
                if ($this->getDistanceBetweenPointsNew($lat, $lon, $records[$i]->lat, $records[$i]->lng, 'Km') > $radius) {
                    unset($records[$i]);
                }
            }
        } else {
            $sql = "SELECT * FROM events WHERE status = 'approved' AND current_city LIKE '%$location%'";
            $query = $this->db->query($sql);
            $records = $query->result();
          
        }

        foreach ($records as $row) {
            $id_host = $row->id;
            $id_user = $row->id_user;
            $sql2 = "SELECT image_path FROM events_images where id_host = '$id_host' limit 1";
            $query2 = $this->db->query($sql2);
            if ($query2->num_rows() > 0) {
                $row->images = $query2->result();
            } else {
                $row->images = array();
            }

            $sql3 = "SELECT u.first_name, u.last_name, i.image_path FROM users u left join users_images i on u.id = i.id_user where u.id = '$id_user'";
            $query3 = $this->db->query($sql3);
            $row->host = $query3->result();

            $sql4 = "SELECT event_date FROM events_dates where id_event = '$id_host' and event_status = 'open' and event_date >= '$today'";
            $query4 = $this->db->query($sql4);
            if ($query4->num_rows() > 0) {
                $row->dates = $query4->result();
                //Adjust price according currency
                $row->price = $this->getPrice($row->price);
                if ($row->currency !== $currency && $row->free == 0) {
                    $row->price = $this->convertCurrency($row->price, $row->currency, $currency);
                }
            } else {
                $row->dates = array();
            }

            $sql5 = "SELECT stars, comment FROM reviews where event_id = '$id_host'";
            $query5 = $this->db->query($sql5);
            if ($query5->num_rows() > 0) {
                $row->reviews = $query5->result();
            } else {
                $row->reviews = array();
            }
        }
        return $records;
    }

    function getPrice($price) {
        $newPrice = (int) $price + ((int) $price * 0.2);
        return round($newPrice);
    }

    function getInitialPrice($price) {
        $newPrice = (int) $price;
        return round($newPrice);
    }

    function convertCurrency($amount, $from, $to) {
        try {
            $endpoint = 'convert';
            $access_key = 'f81b74edd45178fefe42856cf7385115';
            $url = 'https://apilayer.net/api/' . $endpoint . '?access_key=' . $access_key . '&from=' . $from . '&to=' . $to . '&amount=' . $amount;
            $json = file_get_contents($url);
            $obj = json_decode($json);
            if (property_exists($obj, "result")) {
                return round($obj->result);
            } else {
                $to = 'upport@foodiiz.com';
                $data = ["A new error was thrown",
                    'Error converting ' . $amount . ' from ' . $from . ' to ' . $to,
                    'Date: ' . date("d-m-Y H:i:s")];
                $subject = 'A new error was thrown';
                $this->mail->create($data, $to, $subject);
                return round($amount);
            }
        } catch (Exception $e) {
            log_message('Error', 'Error converting ' . $amount . ' from ' . $from . ' to ' . $to . '. Message: ' . $e);
            return round($amount);
        }
    }

    function getDistanceBetweenPointsNew($latitude1, $longitude1, $latitude2, $longitude2, $unit) {
        $theta = $longitude1 - $longitude2;
        $distance = (sin(deg2rad($latitude1)) * sin(deg2rad($latitude2)) + (cos(deg2rad($latitude1)) * cos(deg2rad($latitude2)) * cos(deg2rad($theta))));
        $distance = acos($distance);
        $distance = rad2deg($distance);
        $distance = $distance * 60 * 1.1515;

        switch ($unit) {
            case 'Mi':
                break;
            case 'Km' :
                $distance = $distance * 1.609344;
        }
        return (round($distance, 2));
    }

    function getInineraryByToken($id_user, $token) {
        $sql = "select u.first_name 'host_name', ui.image_path 'host_image', g.first_name 'guest_name', ed.event_status, p.total, e.title, e.free, e.open_hour 'start_time', e.close_hour 'finish_time', e.current_city, e.address, e.lng, e.lat, p.currency, e.price, r.id, r.reservation_token, r.event_id, r.event_date, r.id_host, r.guests_qty 'guest_amonth', r.reservation_status, r.notes, r.phone from reservations r 
                inner join users u on r.id_host = u.id 
                inner join users g on r.id_guest = g.id 
                inner join users_images ui on r.id_host = ui.id_user 
                inner join events e on r.event_id = e.id 
                inner join events_dates ed on r.event_date = ed.event_date and r.event_id = ed.id_event 
                inner join payments p on r.reservation_token = p.reservation_token
                where r.reservation_token = '$token' and r.id_guest = '$id_user'";
        $query = $this->db->query($sql);
        $records = $query->result();
        foreach ($records as $row) {
            $event_id = $row->event_id;
            $sql2 = "SELECT image_path FROM events_images where id_host = '$event_id'";
            $query2 = $this->db->query($sql2);
            $row->images = $query2->result();
        }
        return $records;
    }

    function getEventsDates($id_user) {
        $sql = "select e.id, e.title, e.price, e.max_guests, e.address, e.current_city, ed.event_date, ed.event_status from events e inner join events_dates ed on e.id = ed.id_event where id_user = '$id_user'";
        $query = $this->db->query($sql);
        $records = $query->result();
        foreach ($records as $row) {
            $event_id = $row->id;
            $event_date = $row->event_date;
            $sql2 = "SELECT r.reservation_token, r.guests_qty 'guests', (select sum(total) from payments where reservation_token = r.reservation_token) 'amount', r.event_date FROM reservations r where r.event_id = '$event_id' and r.event_date = '$event_date' and r.reservation_status <> 'canceled'";
            $query2 = $this->db->query($sql2);
            $row->details = $query2->result();
        }
        return $records;
    }

    function updateEvent($id, $date, $status) {
        $sql = "update events_dates set event_status = '$status' where id_event = '$id' and event_date = '$date'";
        $query = $this->db->query($sql);
        return $query;
    }

    function getEventGuestsLists($id, $date) {
        $sql = "SELECT DISTINCT r.reservation_token, p.payment_id, p.total, u.first_name 'guest', h.first_name 'host', u.email 'guest_email', h.email 'host_email', e.title FROM reservations r inner join users u on r.id_guest = u.id inner join users h on r.id_host = h.id inner join events e on r.event_id = e.id inner join payments p on r.reservation_token = p.reservation_token where r.event_id = '$id' and r.event_date = '$date' and r.reservation_status = 'approved'";
        $query = $this->db->query($sql);
        $records = $query->result();
        foreach ($records as $row) {
            $token = $row->reservation_token;
            $sql2 = "update reservations set reservation_status = 'finished' where reservation_token = '$token'";
            $this->db->query($sql2);
        }
        return $records;
    }

    function addRate($data, $token) {
        $sql = "update reservations set reservation_status = 'confirmed' where reservation_token = '$token'";
        $query = $this->db->query($sql);
        $this->db->insert('reviews', $data);
        return $query;
    }

    function updatedRefundPayment($payement_id, $status) {
        $sql = "update payments set payment_status = '$status' where payment_id = '$payement_id'";
        $this->db->query($sql);
    }

    function updatedRefundReservation($id, $status) {
        $sql = "update reservations set reservation_status = '$status' where id = '$id'";
        $query = $this->db->query($sql);
        return $query;
    }

    function getReservationRefundDetails($token) {
        $sql = "SELECT r.id, h.email 'host_email', h.first_name 'host_name', g.email 'guest_email', g.first_name 'guest_name', e.title, r.event_date FROM reservations r inner join users h on r.id_host = h.id inner join users g on r.id_host = g.id inner join events e on r.event_id = e.id where r.reservation_token = '$token'";
        $query = $this->db->query($sql);
        return $query->result();
    }

    function getPremiumHosts() {
        $today = date('Y-m-d');
        //Get currency
        $currency = "";
        $currentSession = $this->session->userdata('user_session');
        if ($currentSession) {
            $currency = $currentSession['currency'];
        } else {
            $currentSession = $this->session->userdata('global');
            $currency = $currentSession['currency'];
        }
        $sql = "SELECT u.id 'id_host', u.first_name, ui.image_path 'host_image', e.id 'id_event', e.title, e.currency, e.open_hour, e.price, e.free, e.soldout, e.city_name, e.experience FROM events e inner join users u on u.id = e.id_user left join users_images ui on ui.id_user = u.id inner join premium_hosts ph on ph.id_user = u.id where e.status = 'approved' and u.active = '1'";
        $query = $this->db->query($sql);
        $records = $query->result();
        foreach ($records as $key => $event) {
            $id_event = $event->id_event;
            $sql4 = "SELECT event_date FROM events_dates where id_event = '$id_event' and event_status = 'open' and event_date >= '$today'";
            $query4 = $this->db->query($sql4);
            $has_dates = $query4->num_rows() > 0;
            if ($has_dates) {
                $event->dates = $query4->result();
                $event->price = $this->getPrice($event->price);
                if ($event->currency !== $currency && $event->free == 0) {
                    $event->price = $this->convertCurrency($event->price, $event->currency, $currency);
                }
                $sql3 = "SELECT image_path FROM events_images where id_host = '$id_event' limit 1";
                $query3 = $this->db->query($sql3);
                if ($query3->num_rows() > 0) {
                    $event->image = $query3->result()[0]->image_path;
                } else {
                    $event->image = null;
                }
                $sql5 = "SELECT stars, comment FROM reviews where event_id = '$id_event'";
                $query5 = $this->db->query($sql5);
                if ($query5->num_rows() > 0) {
                    $event->reviews = $query5->result();
                } else {
                    $event->reviews = array();
                }
            } else {
                unset($records[$key]);
            }
            $has_dates = false;
        }
        return $records;
    }

    /**
     * @name executePayments
     * @description Executes the payments to the hosts
     */
    function executePayments() {
        $date = date('Y-m-d', mktime(0, 0, 0, date("m"), date("d") - 2, date("Y")));
        $sql = "SELECT ed.id_event, ed.event_date, e.free, e.title, u.id 'id_host', u.first_name 'host_name', u.last_name, u.email 'host_email', e.current_city, e.currency FROM events_dates ed inner join events e on ed.id_event = e.id inner join users u on e.id_user = u.id where ed.event_status = 'finished' and ed.event_date < '$date'";
        $query = $this->db->query($sql);
        $records = $query->result();
        foreach ($records as $row) {
            $event_id = $row->id_event;
            $event_date = $row->event_date;
            $id_host = $row->id_host;
            $sql2 = "SELECT r.reservation_token, r.id_host, r.id_guest, p.payment_id, p.total, p.currency, u.email, u.first_name, u.last_name FROM reservations r inner join events e on r.id_host = e.id inner join payments p on r.reservation_token = p.reservation_token inner join users u on r.id_guest = u.id where r.event_id = '$event_id' and r.event_date = '$event_date' and r.reservation_status = 'approved'";
            $query2 = $this->db->query($sql2);
            $row->has_method = false;
            if ($query2->num_rows() > 0) {
                $total = 0;
                $row->reservations = $query2->result();
                foreach ($row->reservations as $reservation) {
                    $total = $total + $reservation->total;
                }
                $sql3 = "select account_id, country from user_stripeaccount where user_id = '" . $id_host . "' and active = '1'";
                $query3 = $this->db->query($sql3);
                if ($query3->num_rows() > 0) {
                    $row->method = 'stripe';
                    $row->stripe_account = $query3->result();
                    $row->has_method = true;
                }

                if (!$row->has_method) {
                    $sql4 = "select currency, user_name, bank_name, bank_number, bank_swift from user_bankaccount where user_id = '" . $id_host . "' and active = '1'";
                    $query4 = $this->db->query($sql4);
                    if ($query4->num_rows() > 0) {
                        $row->method = 'bank';
                        $row->bank_account = $query4->result();
                        $row->has_method = true;
                    }
                }
                //Getting host payment
                $row->pay_to_host = $this->checkDecimals((int) $total * 0.8);
                $row->pay_to_host_int = (int) $total * 0.8;
                //Getting Foodiiz payment
                $row->pay_to_foodiiz = $this->checkDecimals((int) $total * 0.2);
                $row->pay_to_foodiiz_int = (int) $total * 0.2;
                //Getting total
                $row->total_payments = $this->checkDecimals($total);
                $row->total_payments_int = $total;
            } else {
                $row->reservations = array();
            }
        }
        return $records;
    }

    function checkDecimals($amount) {
        $decimals = explode(".", $amount);
        $amount = isset($decimals[1]) ? ($decimals[0] . $decimals[1] . '0') : ($decimals[0] . '00');
        return $amount;
    }

    function finishEvents() {
        $date = date('Y-m-d', mktime(0, 0, 0, date("m"), date("d") - 1, date("Y")));
        $sql = "SELECT * FROM events_dates where event_status = 'open' and event_date < '$date'";
        $query = $this->db->query($sql);
        if ($query->num_rows() > 0) {
            $records = $query->result();
            foreach ($records as $event) {
                $id = $event->id_event;
                $date = $event->event_date;
                $status = 'finished';
                $this->updateEvent($id, $date, $status);
            }
        }
    }

}
