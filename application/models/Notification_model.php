<?php

Class Notification_model extends CI_Model
{


    function get($id)
    {
        $sql = "SELECT * FROM notification n where n.id='$id'";
        $query = $this->db->query($sql);
        return $query->result();
    }

    function getall($id)
    {
        $sql = "SELECT DISTINCT(n.id), n.*, u.first_name, u.last_name, u.email, e.title, ui.image_path FROM notification n inner join users u on n.host = u.id inner join events e on n.host = e.id inner join users_images ui on n.guest = ui.id_user where n.host = '$id' or n.guest =  '$id'";
        $query = $this->db->query($sql);
        return $query->result();
    }


    function save($data)
    {
        $query = $this->db->insert('notification', $data);
        return $query;
    }

    function getcomments($id)
    {
        $sql = "SELECT c.*,u.first_name, u.last_name FROM notification_comments c inner join users u on c.id_user = u.id where c.id_notification = '$id' order by date asc";
        $query = $this->db->query($sql);
        $records = $query->result();
        foreach ($records as $row) {
            $id_user = $row->id_user;
            $sql2 = "SELECT image_path FROM users_images where id_user = '$id_user'";
            $query2 = $this->db->query($sql2);
            $image = $query2->result();
            $row->image_path = $image[0]->image_path;
        }
        return $records;
    }

    function savecomments($data)
    {
        $query = $this->db->insert('notification_comments', $data);
        return $query;
    }

    function updatenotification($id, $status)
    {
        $sql = "update notification set status ='$status' where id='$id'";
        $this->db->query($sql);
    }


}