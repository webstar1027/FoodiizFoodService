<?php

defined('BASEPATH') OR exit('No direct script access allowed');

class PaymentModel extends CI_Model {

    public function __construct() {
        parent::__construct();
    }

    public function insert($paymentdata, $reservationdata) {
        $this->db->insert('reservations', $reservationdata);
        $query = $this->db->insert('payments', $paymentdata);
        return $query;
    }

    public function eventCancelation($data) {
        $query = $this->db->insert('other_payments', $data);
        return $query;
    }

    public function guestEventCancelation($token) {
        $date = date("Y-m-d H:i:s");
        $data = array('payment_status' => 'refunded', 'updated_on' => $date);
        $query = $this->db->update('payments', $data, array('reservation_token' => $token));
        return $query;
    }

    public function getPaymentId($token) {
        $sql = "SELECT payment_id FROM payments where reservation_token = '$token'";
        $query = $this->db->query($sql);
        return $query->result();
    }

}
