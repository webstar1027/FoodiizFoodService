<?php

defined('BASEPATH') OR exit('No direct script access allowed');

class Notification extends CI_Controller {

    function __construct() {
        parent::__construct();
        $this->load->model('notification_model', '', TRUE);
        $this->load->library('session');
    }

    /* SAVE NOTIFICATION */

    public function save() {
        $user = $this->session->userdata('user_session');
        $data = array(
            'subject' => $user['first_name'] . ' ' . $user['last_name'],
            'message' => $this->input->post('message'),
            'host' => $this->input->post('host'),
            'guest' => $user['id'],
            'date' => date('Y-m-d H:i'),
            'status' => 0
        );
        $result = $this->notification_model->save($data);
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

    /**
     * GET ALL THE USER FROM
     * @return object
     */
    public function getall() {
        $user = $this->session->userdata('user_session');
        $id = $user['id'];
        $result = $this->notification_model->getall($id);
        echo json_encode(array(
            "notifications" => $result
        ));
    }

    /**
     * GET BY ID NOTIFICATION
     * @return object
     */
    public function get() {
        $id = $this->input->post('id');
        $result = $this->notification_model->get($id);
        echo json_encode(array(
            "notifications" => $result
        ));
    }

    /**
     * GET COMMENTS BY ID NOTIFICATION
     * @return object
     */
    public function getcomments() {
        $id = $this->input->post('id');
        $result = $this->notification_model->getcomments($id);
        echo json_encode(array(
            "comments" => $result
        ));
    }

    /**
     * SAVE COMMENTS BY ID NOTIFICATION
     * @return object
     */
    public function savecomments() {
        $user = $this->session->userdata('user_session');
        $id = $user['id'];
        $data = array(
            'id_notification' => $this->input->post('id_notification'),
            'comment' => $this->input->post('comment'),
            'date' => date('Y-m-d H:i'),
            'id_user' => $id
        );

        $result = $this->notification_model->savecomments($data);
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

    /**
     * UPDATE NOTIFICATION status
     * @return object
     */
    public function updatenotification() {
        $id = $this->input->post('id');
        $status = $this->input->post('status');

        $result = $this->notification_model->updatenotification($id, $status);
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

}
