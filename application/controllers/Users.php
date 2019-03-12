<?php

defined('BASEPATH') OR exit('No direct script access allowed');

class Users extends CI_Controller {

    function __construct() {
        parent::__construct();
        $this->load->model('users_model', '', TRUE);
        $this->load->library('session');
        $this->load->library('mail');
      

    }

    public function register() {      
      
        $password = $this->input->post('password');
        $data = array(
            'first_name' => $this->input->post('first_name'),
            'last_name' => $this->input->post('last_name'),
            'email' => $this->input->post('email'),
            'password' => md5($password),
            'news' => $this->input->post('news'),
            'status' => 'no_confirmed',
            'active' => 1,
            'rol' => 1
        );
        $token = substr(md5(uniqid(mt_rand(), true)), 0, 24);
        $url = base_url() . 'confirm-your-email/' . $token;           
        $login_data_afterverification = array(
            'email' => $data['email'],
            'password' => $password
        );
        $this->session->set_userdata('afterverification', $login_data_afterverification);
        $result = $this->users_model->register($data, $token);
        if ($result) {
            //SMTP & mail configuration          
            $to = $this->input->post('email');
            $text = "Confirm your email";
            $link = $this->mail->button($url, $text);
            $data = ["It’s a great pleasure to welcome you on FOODIIZ.",
                "Below we have mentioned your account details.",
                "Login : " . $to,
                "Password: " . $password,
                "You are almost ready to get started with an extraordinary food experience. Please confirm your email address so we know you are a real Foodiiz friend.",
                $link];
            $subject = "Welcome to the FOODIIZ community";
            $this->mail->create($data, $to, $subject);
            //Admin notification
            $admin_url = "https://admin.foodiiz.com/users/edit/" . $result;
            $edit_link = $this->mail->button($admin_url, "Review the user");
            $admin_data = ["A new user has been registered in Foodiiz",
                "You can review the user details in the following link:",
                $edit_link];
            $this->notifyAdmin($admin_data);
            echo json_encode(array(
                "response" => "success"
            ));
        } else {
            echo json_encode(array(
                "response" => "failed"
            ));
        }
    }

    function notifyAdmin($data) {
        $subject = "A new event user has register an account in Foodiiz.";
        $to = "client@foodiiz.com";
        $this->mail->create($data, $to, $subject);
    }

    public function registerFacebook() {
        $email = $this->input->post('email');
        if ($email != "") {
            $user_exists = $this->users_model->checkuserByEmail($email);
            if ($user_exists) {
                $is_premium = false;
                if (isset($user_exists[0]->premium)) {
                    $is_premium = true;
                }
                $user = array(
                    'id' => $user_exists[0]->id,
                    'first_name' => $user_exists[0]->first_name,
                    'last_name' => $user_exists[0]->last_name,
                    'email' => $user_exists[0]->email,
                    'genre' => $user_exists[0]->genre,
                    'birthdate' => $user_exists[0]->birthdate,
                    'phone_number' => $user_exists[0]->phone_number,
                    'description' => $user_exists[0]->description,
                    'status' => $user_exists[0]->status,
                    'active' => $user_exists[0]->active,
                    'address' => $user_exists[0]->address,
                    'school' => $user_exists[0]->school,
                    'work' => $user_exists[0]->work,
                    'time_zone' => $user_exists[0]->time_zone,
                    'currency' => 'USD',
                    'is_premium' => $is_premium,
                    'show_premium' => $user_exists[0]->show_premium
                );
                // Set session
                if ($user_exists[0]->active == '1') {
                    $this->session->set_userdata('user_session', $user);
                } else {
                    $this->session->unset_userdata('user_session');
                }
                echo json_encode(array(
                    "response" => "login",
                    "user" => json_encode($user)
                ));
            } else {
                $password = substr(md5(uniqid(mt_rand(), true)), 0, 8);
                $data = array(
                    'first_name' => $this->input->post('first_name'),
                    'last_name' => $this->input->post('last_name'),
                    'email' => $this->input->post('email'),
                    'password' => md5($password),
                    'genre' => $this->input->post('gender'),
                    'news' => 0,
                    'status' => 'confirmed',
                    'active' => 1,
                    'rol' => 1
                );
                $id_user = $this->users_model->registerFacebook($data);
                if ($id_user) {
                    $cover_url = $this->input->post('cover_url');
                    $destination_folder = './assets/images/users/';
                    $imgName = substr(md5(uniqid(mt_rand(), true)), 0, 30) . ".jpg";
                    $newfname = $destination_folder . $imgName;
                    $file = fopen($cover_url, "rb");
                    if ($file) {
                        $newf = fopen($newfname, "a");
                        if ($newf)
                            while (!feof($file)) {
                                fwrite($newf, fread($file, 1024 * 8), 1024 * 8);
                            }
                    }
                    if ($file) {
                        fclose($file);
                    }
                    if ($newf) {
                        fclose($newf);
                    }
                    $filePath = 'assets/images/users/' . $imgName;
                    $this->users_model->saveUserImage($filePath, $id_user);
                    $to = $email;
                    $data = ["Dear Foodiiz friend,",
                        "It’s a great pleasure to welcome you on FOODIIZ.",
                        "Below we have mentioned your account details.",
                        "Login : " . $email,
                        "Password: " . $password];
                    $subject = 'Welcome to the FOODIIZ community';
                    $this->mail->create($data, $to, $subject);

                    //Admin notification
                    $admin_url = "https://admin.foodiiz.com/users/edit/" . $id_user;
                    $edit_link = $this->mail->button($admin_url, "Review the user");
                    $admin_data = ["A new user has been registered in Foodiiz",
                        "You can review the user details in the following link:",
                        $edit_link];
                    $this->notifyAdmin($admin_data);

                    echo json_encode(array(
                        "response" => "success"
                    ));
                } else {
                    echo json_encode(array(
                        "response" => "failed"
                    ));
                }
            }
        } else {
            echo json_encode(array(
                "response" => "failed"
            ));
        }
    }

    public function login() {
        $email = $this->input->post('email');
        $password = md5($this->input->post('password'));
        $result = $this->users_model->login($email, $password);
        if ($result) {
            $userdata = $this->users_model->getUserInfo($result[0]->id);
            $is_premium = false;
            if (isset($userdata[0]->premium)) {
                $is_premium = true;
            }
            $user = array(
                'id' => $userdata[0]->id,
                'first_name' => $userdata[0]->first_name,
                'last_name' => $userdata[0]->last_name,
                'email' => $userdata[0]->email,
                'genre' => $userdata[0]->genre,
                'birthdate' => $userdata[0]->birthdate,
                'phone_number' => $userdata[0]->phone_number,
                'description' => $userdata[0]->description,
                'status' => $userdata[0]->status,
                'active' => $userdata[0]->active,
                'address' => $userdata[0]->address,
                'school' => $userdata[0]->school,
                'work' => $userdata[0]->work,
                'time_zone' => $userdata[0]->time_zone,
                'currency' => $userdata[0]->currency,
                'language' => $userdata[0]->language,
                'is_premium' => $is_premium,
                'show_premium' => $userdata[0]->show_premium
            );
            // Set session
            if ($userdata[0]->active == '1') {
                $this->session->set_userdata('user_session', $user);
            } else {
                $this->session->unset_userdata('user_session');
            }
            echo json_encode(array(
                "response" => "success",
                "user" => json_encode($user)
            ));
        } else {
            echo json_encode(array(
                "response" => "failed"
            ));
        }
    }

    public function resetPassword() {
        $email = $this->input->post('email');
        $password = md5($this->input->post('password'));
        $result = $this->users_model->resetPassword($email, $password);
        if ($result) {
            $this->users_model->expireResetToken($email);
            $to = $this->input->post('email');
            $data = ["Dear Foodiiz friend,",
                "Your FOODIIZ access has been restored.",
                "Below we have mentioned your account details.",
                "Login : " . $this->input->post('email'),
                "Password: " . $this->input->post('password')];
            $subject = 'Your FOODIIZ access has been restored';
            $this->mail->create($data, $to, $subject);
            echo json_encode(array(
                "response" => "success"
            ));
        } else {
            echo json_encode(array(
                "response" => "failed"
            ));
        }
    }
    
    public function isVerified() {
        $email = $this->input->post('email');
        $password = $this->input->post('password');
        $result = $this->users_model->isVerified($email, $password);
        if ($result) {
            echo json_encode(array(
                "response" => $result
            ));
        } else {
            echo json_encode(array(
                "response" => 'failed'
            ));
        }
    }
    public function checkEmailExists() {
        $email = $this->input->post('email');
        $result = $this->users_model->checkEmailExists($email);
        if ($result) {
            echo json_encode(array(
                "response" => "true"
            ));
        } else {
            echo json_encode(array(
                "response" => "false"
            ));
        }
    }

    /**
     * @return object
     */
    public function checkSession() {
        $user = $this->session->userdata('user_session');
        if (!empty($user)) {
            echo json_encode(array(
                "session" => true,
                "user" => $user
            ));
        } else {
            $global = $this->session->userdata('global');
            if (empty($global)) {
                /* $lang = substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 2);
                  $langoptions = array("en", "fr", "it", "gr", "po", "es");
                  $usedefault = true;
                  for ($i = 0; $i < count($langoptions); $i++) {
                  if ($lang == $langoptions[$i]) {
                  $usedefault = false;
                  }
                  }
                  if ($usedefault) {
                  $lang = "en";
                  } */
                $global = array('currency' => "EUR", 'language' => "en");
                $this->session->set_userdata('global', $global);
                $global = $this->session->userdata('global');
                echo json_encode(array(
                    "session" => false,
                    "user" => $global
                ));
            } else {
                echo json_encode(array(
                    "session" => false,
                    "user" => $global
                ));
            }
        }
    }

    function updateCurrency() {
        $currency = $this->input->post('currency');
        if (!empty($currency)) {
            $currentSession = $this->session->userdata('user_session');
            if ($currentSession) {
                $currentSession['currency'] = $currency;
                $this->session->set_userdata('user_session', $currentSession);
                $currentSession = $this->session->userdata('user_session');
            } else {
                $globalSession = $this->session->userdata('global');
                $globalSession['currency'] = $currency;
                $this->session->set_userdata('global', $globalSession);
            }
        }
    }

    function updateLanguage() {
        $language = $this->input->post('language');
        $currentSesstion = $this->session->userdata('user_session');
        if ($currentSesstion) {
            $currentSesstion['language'] = $language;
            $this->session->set_userdata('user_session', $currentSesstion);
            $currentSesstion = $this->session->userdata('user_session');
        } else {
            $currentSesstion = $this->session->userdata('global');
            $currentSesstion['language'] = $language;
            $this->session->set_userdata('global', $currentSesstion);
            $currentSesstion = $this->session->userdata('global');
        }
    }

    function updatePassword() {
        $user = $this->session->userdata('user_session');
        $id = $user['id'];
        $password = $this->input->post('password');
        $result = $this->users_model->updatePassword($id, $password);
        if ($result === true) {
            echo json_encode(array(
                "response" => "success"
            ));
        } else {
            echo json_encode(array(
                "response" => "password_failed"
            ));
        }
    }

    /**
     *
     */
    public function killSession() {
        $this->session->unset_userdata('user_session');
        $this->session->unset_userdata('global');
        session_destroy();
        redirect('home', 'refresh');
    }

    public function becomePremium() {
        $user = $this->session->userdata('user_session');
        $id = $user['id'];
        $result = $this->users_model->becomePremium($id);
        if ($result) {
            $user['is_premium'] = true;
            $this->session->set_userdata('user_session', $user);
            echo json_encode(array(
                "response" => "success"
            ));
        } else {
            echo json_encode(array(
                "response" => "error"
            ));
        }
    }

    function validateDate($date, $format = 'Y-m-d') {
        $d = DateTime::createFromFormat($format, $date);
        return $d && $d->format($format) == $date;
    }

    public function save() {
        $user = $this->session->userdata('user_session');
        $id = $user['id'];

        $birthdate = $this->input->post('birthdate');
        $valid_date = $this->validateDate($birthdate);
        if (!$valid_date) {
            $birthdate = '0000-00-00';
        }
        $description = $this->input->post('description');
        $description = str_replace("'", "&#39;", $description);
        $user = array(
            'first_name' => $this->input->post('first_name'),
            'last_name' => $this->input->post('last_name'),
            'address' => $this->input->post('address'),
            'birthdate' => $birthdate,
            'description' => $description,
            'genre' => $this->input->post('genre'),
            'phone_number' => $this->input->post('phone_number'),
            'country_code' => $this->input->post('country_code'),
            'school' => $this->input->post('school'),
            'time_zone' => $this->input->post('time_zone'),
            'work' => $this->input->post('work')
        );
        $settings = array(
            'currency' => $this->input->post('currency'),
            'language' => $this->input->post('language'),
            'preferences' => $this->input->post('preferences'),
            'languages' => json_encode($this->input->post('languages'))
        );
        $result = $this->users_model->save($id, $user, $settings);
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
     * @return object
     */
    public function getUserInfo() {
        $user = $this->session->userdata('user_session');
        $id = $user['id'];
        $result = $this->users_model->getUserInfo($id);
        if ($result) {
            echo json_encode(array(
                "user" => $result[0]
            ));
        }
    }

    /**
     * @return object
     */
    public function getUserInfoId() {
        $id = $this->input->post('id');
        $result = $this->users_model->getUserInfo($id);
        if ($result) {
            echo json_encode(array(
                "user" => $result[0]
            ));
        }
    }

    /**
     * @name confirmEmail
     * @description confirms the user email
     */
    public function confirmEmail() {
        $token = $this->input->post('token');
        $result = $this->users_model->confirmEmail($token);
        $data = $this->session->userdata('afterverification');
        if ($result) {
            $this->session->unset_userdata('afterverification');
            echo json_encode(array(
                "response" => "success",
                "login_data" => $data
            ));
        } else {
            echo json_encode(array(
                "response" => "failed"
            ));
        }
    }

    public function validateResetToken() {
        $token = $this->input->post('token');
        $email = $this->users_model->validateResetToken($token);
        if ($email) {
            echo json_encode(array(
                "response" => "success",
                "email" => $email[0]->email
            ));
        } else {
            echo json_encode(array(
                "response" => "failed"
            ));
        }
    }

    function sendResetToken() {
        $email = $this->input->post('email');
        $result = $this->users_model->checkEmailExists($email);
        if ($result) {
            $token = substr(md5(uniqid(mt_rand(), true)), 0, 24);
            $url = base_url() . 'reset-password/' . $token;
            $result = $this->users_model->storeResetToken($email, $token);
            if ($result) {
                $to = $email;
                $text = "Reset my password";
                $link = $this->mail->button($url, $text);
                $data = ["Dear Foodiiz friend,",
                    "You have requested to reset the password for username: " . $email,
                    "Please click the following link to reset your password.",
                    $link];
                $subject = "Your password has been restored.";
                $this->mail->create($data, $to, $subject);
                echo json_encode(array(
                    "response" => "success"
                ));
            }
        } else {
            echo json_encode(array(
                "response" => "false"
            ));
        }
    }

    /**
     * @name saveImage
     */
    function saveImage() {
        if (!empty($_FILES)) {
            $file_element_name = "file";
            $config['upload_path'] = './assets/images/users/';
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
                $filePath = 'assets/images/users/' . $upload_data['file_name'];
                //resize:
                $config['image_library'] = 'gd2';
                $config['source_image'] = $upload_data['full_path'];
                $config['maintain_ratio'] = TRUE;
                $config['width'] = 400;
                $config['height'] = 400;
                $this->image_lib->clear();
                $this->image_lib->initialize($config);
                $this->image_lib->resize();
                $user = $this->session->userdata('user_session');
                $id = $user['id'];
                $this->users_model->saveUserImage($filePath, $id);
                @unlink($_FILES[$file_element_name]);
                echo json_encode(array(
                    "response" => $filePath
                ));
            }
        }
    }

    public function saveStripeAccount() {
        $user = $this->session->userdata('user_session');
        $user_id = $user['id'];
        $id = $this->input->post('id');
        $stripe_account = $this->input->post('stripe_account');
        $result = $this->users_model->saveStripeAccount($user_id, $id, $stripe_account);
        echo json_encode(array(
            "response" => "success"
        ));
    }

    public function savePaypalAccount() {
        $user = $this->session->userdata('user_session');
        $user_id = $user['id'];
        $id = $this->input->post('id');
        $paypal_email = $this->input->post('paypal_email');
        $result = $this->users_model->savePaypalAccount($user_id, $id, $paypal_email);
        echo json_encode(array(
            "response" => "success"
        ));
    }

    public function saveBankAccount() {
        $user = $this->session->userdata('user_session');
        $user_id = $user['id'];
        $id = $this->input->post('id');
        $currency = $this->input->post('currency');
        $username = $this->input->post('username');
        $bankname = $this->input->post('bankname');
        $banknumber = $this->input->post('banknumber');
        $bankswift = $this->input->post('bankswift');
        $extrainfo = $this->input->post('extrainfo');
        $result = $this->users_model->saveBankAccount($user_id, $id, $currency, $username, $bankname, $banknumber, $bankswift, $extrainfo);
        echo json_encode(array(
            "response" => "success"
        ));
    }

    function showUserById() {
        $id = $this->input->post('id');
        $result = $this->users_model->showUserById($id);
        if ($result) {
            echo json_encode(array(
                "user" => $result[0]
            ));
        }
    }

}
