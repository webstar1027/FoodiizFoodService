<?php

Class Users_model extends CI_Model {

    function __construct() {
        parent::__construct();
        $this->load->library('session');
    }

    function register($data, $token) {
        $this->db->insert('users', $data);
        $id_user = $this->db->insert_id();

        $currentSession = $this->session->userdata('global');
        $language = "";
        if (!empty($currentSession)) {
            $language = $currentSession['language'];
        } else {
            $language = "en";
        }

        $settings = array(
            'id_user' => $id_user,
            'currency' => "EUR",
            'language' => $language,
            'preferences' => ""
        );
        $this->db->insert('users_settings', $settings);
        $tokenData = array('id_user' => $id_user, 'token' => $token);
        $this->db->insert('users_email_validation', $tokenData);
        return $id_user;
    }

    function storeResetToken($email, $token) {
        $tokenData = array('email' => $email, 'token' => $token, 'status' => '1');
        $query = $this->db->insert('reset_password_token', $tokenData);
        return $query;
    }

    function validateResetToken($token) {
        $sql = "SELECT email FROM reset_password_token where token = '$token' and status = '1'";
        $query = $this->db->query($sql);
        return $query->result();
    }

    function resetPassword($email, $password) {
        $data = array('password' => $password);
        $query = $this->db->update('users', $data, array('email' => $email));
        return $query;
    }

    function updatePassword($id, $password) {
        $result = true;
        $newpassword = md5($password);
        $sql = "SELECT password FROM users where id = '$id'";
        $query = $this->db->query($sql);
        $check = $query->result()[0]->password;
        if ($check === $newpassword) {
            $return = false;
        } else {
            $this->db->update('users', array('password' => $newpassword), array('id' => $id));
        }
        return $result;
    }

    function becomePremium($id) {
        $sql = "SELECT * FROM premium_hosts where id_user = '$id'";
        $query = $this->db->query($sql);
        if ($query->num_rows() === 0) {
            $date = date('Y-m-d');
            $data = array('id_user' => $id, 'joined' => $date);
            $query = $this->db->insert('premium_hosts', $data);
        }
        return $query->result();
    }

    function isVerified($email, $password) {
       
        $sql = "SELECT * FROM users WHERE email ='$email'";
        $query = $this->db->query($sql);
        $confirm = $query->result()[0]->status;       
        return $confirm;

    }

    function expireResetToken($email) {
        $data = array('status' => '0');
        $this->db->update('reset_password_token', $data, array('email' => $email));
    }

    function registerFacebook($data) {
        $this->db->insert('users', $data);
        $id_user = $this->db->insert_id();
        $settings = array('id_user' => $id_user, 'currency' => "USD", 'language' => "en", 'preferences' => "");
        $this->db->insert('users_settings', $settings);
        return $id_user;
    }

    function login($email, $password) {
        $sql = "SELECT * FROM users where email = '$email' and password = '$password'";
        $query = $this->db->query($sql);
        return $query->result();
    }

    function checkuserByEmail($email) {
        $sql = "SELECT u.*, ph.id_user 'premium' FROM users u left join premium_hosts ph on u.id = ph.id_user where u.email = '$email'";
        $query = $this->db->query($sql);
        $records = $query->result();
        foreach ($records as $row) {
            $sql = "SELECT * FROM premium_hosts";
            $query = $this->db->query($sql);
            if ($query->num_rows() < 100) {
                $row->show_premium = true;
            } else {
                $row->show_premium = false;
            }
        }
        return $records;
    }

    function getUserInfo($id) {
        $sql = "SELECT u.id, u.active, u.address, u.birthdate, u.description, u.email, u.first_name, u.last_name, u.genre, u.country_code, u.phone_number, u.school, u.status, u.time_zone, u.work, i.image_path, s.currency, s.language, s.languages, s.preferences, ph.id_user 'premium' FROM users u left join users_images i on u.id = i.id_user left join users_settings s on u.id = s.id_user left join premium_hosts ph on u.id = ph.id_user where u.id = '$id'";
        $query = $this->db->query($sql);
        $records = $query->result();
        foreach ($records as $row) {
            $sql1 = "SELECT * FROM user_paypal where user_id = '$id' and active = 1";
            $query1 = $this->db->query($sql1);
            if ($query1->num_rows() > 0) {
                $row->paypalaccount = $query1->result();
            }

            $sql2 = "SELECT * FROM user_stripeaccount where user_id = '$id' and active = 1";
            $query2 = $this->db->query($sql2);
            if ($query2->num_rows() > 0) {
                $row->stripeaccount = $query2->result();
            }
            $sql3 = "SELECT * FROM user_bankaccount where user_id = '$id' and active = 1";
            $query3 = $this->db->query($sql3);
            if ($query3->num_rows() > 0) {
                $row->bankaccount = $query3->result();
            }
            $sql4 = "select r.event_id, r.review_from, r.comment, r.date, r.stars, u.first_name 'guest_name', ui.image_path from reviews r inner join users u on u.id = r.review_from left join users_images ui on ui.id_user = u.id where review_to = '$id'";
            $query4 = $this->db->query($sql4);
            if ($query4->num_rows() > 0) {
                $row->reviews = $query4->result();
            } else {
                $row->reviews = array();
            }
            $sql5 = "SELECT * FROM premium_hosts";
            $query5 = $this->db->query($sql5);
            if ($query5->num_rows() < 100) {
                $row->show_premium = true;
            } else {
                $row->show_premium = false;
            }
        }
        return $records;
    }

    function saveUserImage($image, $id) {
        $sql = "SELECT * FROM users_images where id_user = '$id'";
        $query = $this->db->query($sql);
        if ($query->num_rows() > 0) {
            //Remove old image
            $old_path = $query->result()[0]->image_path;

            unlink(realpath($old_path));

            $data = array(
                'image_path' => $image
            );
            $this->db->update('users_images', $data, array('id_user' => $id));
        } else {
            $data = array(
                'id_user' => $id,
                'image_path' => $image
            );
            $this->db->insert('users_images', $data, array('id_user' => $id));
        }
    }

    function checkEmailExists($email) {
        $sql = "SELECT * FROM users where email = '$email'";
        $query = $this->db->query($sql);
        return $query->result();
    }

    function confirmEmail($token) {
        $sql = "SELECT id_user FROM users_email_validation where token = '$token'";
        $query = $this->db->query($sql);
        if ($query->num_rows() > 0) {
            $id_user = $query->result()[0]->id_user;
            $data = array(
                'status' => 'confirmed'
            );
            $query = $this->db->update('users', $data, array('id' => $id_user));
            //Delete token
            $sql = "DELETE FROM users_email_validation where token = '$token'";
            $this->db->query($sql);
        } else {
            $query = null;
        }
        return $query;
    }

    function save($id, $user, $settings) {
        $this->db->update('users', $user, array('id' => $id));
        $query = $this->db->update('users_settings', $settings, array('id_user' => $id));
        return $query;
    }

    function saveStripeAccount($user_id, $id, $stripe_account) {
        $sql1 = "SELECT * FROM user_paypal where user_id = '$user_id'";
        $query1 = $this->db->query($sql1);
        if ($query1->num_rows() > 0) {
            $data = array('active' => '0');
            $this->db->update('user_paypal', $data, array('user_id' => $user_id));
        }

        $sql2 = "SELECT * FROM user_bankaccount where user_id = '$user_id'";
        $query2 = $this->db->query($sql2);
        if ($query2->num_rows() > 0) {
            $data = array('active' => '0');
            $this->db->update('user_bankaccount', $data, array('user_id' => $user_id));
        }

        $sql3 = "SELECT * FROM user_stripeaccount where user_id = '$user_id'";
        $query3 = $this->db->query($sql3);
        if ($query3->num_rows() > 0) {
            $id = $query3->result()[0]->id;
            $data = array('user_id' => $user_id, 'account_id' => $stripe_account, 'active' => '1');
            $query = $this->db->update('user_stripeaccount', $data, array('id' => $id));
        } else {
            $data = array('user_id' => $user_id, 'account_id' => $stripe_account, 'active' => '1');
            $query = $this->db->insert('user_stripeaccount', $data);
        }
        return $query;
    }

    function savePaypalAccount($user_id, $id, $paypal_email) {
        $sql1 = "SELECT * FROM user_stripeaccount where user_id = '$user_id'";
        $query1 = $this->db->query($sql1);
        if ($query1->num_rows() > 0) {
            $data = array('active' => '0');
            $this->db->update('user_stripeaccount', $data, array('user_id' => $user_id));
        }

        $sql2 = "SELECT * FROM user_bankaccount where user_id = '$user_id'";
        $query2 = $this->db->query($sql2);
        if ($query2->num_rows() > 0) {
            $data = array('active' => '0');
            $this->db->update('user_bankaccount', $data, array('user_id' => $user_id));
        }

        if ($id == "") {
            $data = array('user_id' => $user_id, 'paypal_email' => $paypal_email, 'active' => '1');
            $query = $this->db->insert('user_paypal', $data);
        } else {
            $data = array('user_id' => $user_id, 'paypal_email' => $paypal_email, 'active' => '1');
            $query = $this->db->update('user_paypal', $data, array('id' => $id));
        }
        return $query;
    }

    function saveBankAccount($user_id, $id, $currency, $username, $bankname, $banknumber, $bankswift, $extrainfo) {
        $sql1 = "SELECT * FROM user_paypal where user_id = '$user_id'";
        $query1 = $this->db->query($sql1);
        if ($query1->num_rows() > 0) {
            $data = array('active' => '0');
            $this->db->update('user_paypal', $data, array('user_id' => $user_id));
        }

        $sql2 = "SELECT * FROM user_stripeaccount where user_id = '$user_id'";
        $query2 = $this->db->query($sql2);
        if ($query2->num_rows() > 0) {
            $data = array('active' => '0');
            $this->db->update('user_stripeaccount', $data, array('user_id' => $user_id));
        }
        if ($id == "") {
            $data = array('user_id' => $user_id, 'currency' => $currency, 'user_name' => $username, 'bank_name' => $bankname, 'bank_number' => $banknumber, 'bank_swift' => $bankswift, 'extra_info' => $extrainfo, 'active' => '1');
            $query = $this->db->insert('user_bankaccount', $data);
        } else {
            $data = array('user_id' => $user_id, 'user_name' => $username, 'bank_name' => $bankname, 'bank_number' => $banknumber, 'bank_swift' => $bankswift, 'extra_info' => $extrainfo, 'active' => '1');
            $query = $this->db->update('user_bankaccount', $data, array('id' => $id));
        }
        return $query;
    }

    function showUserById($id) {
        $sql = "SELECT u.first_name, u.description, u.address, u.status, ui.image_path, us.languages FROM users u left join users_images ui on ui.id_user = u.id left join users_settings us on us.id_user = u.id where u.id = '$id' and active = '1'";
        $query = $this->db->query($sql);
        $records = $query->result();
        foreach ($records as $row) {
            $sql2 = "SELECT e.id, e.title, e.description FROM events e where e.id_user = '$id' and e.status = 'approved'";
            $query2 = $this->db->query($sql2);
            if ($query2->num_rows() > 0) {
                $events_data = $query2->result();
                foreach ($events_data as $event) {
                    $id_host = $event->id;
                    $sql4 = "SELECT image_path FROM events_images where id_host = '$id_host' limit 1";
                    $query4 = $this->db->query($sql4);
                    $event->image = $query4->result()[0]->image_path;
                }
                $row->events = $events_data;
            } else {
                $row->events = array();
            }
            $sql3 = "select r.event_id, r.review_from, r.comment, r.date, r.stars, u.first_name 'guest_name', ui.image_path from reviews r inner join users u on u.id = r.review_from left join users_images ui on ui.id_user = u.id where review_to = '$id'";
            $query3 = $this->db->query($sql3);
            if ($query3->num_rows() > 0) {
                $row->reviews = $query3->result();
            } else {
                $row->reviews = array();
            }
        }
        return $records;
    }

}
